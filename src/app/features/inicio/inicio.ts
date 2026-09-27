import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { Params, Router, RouterLink } from '@angular/router';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgTemplateOutlet } from '@angular/common';
import { forkJoin } from 'rxjs';

import { AnimalService } from '../../services/animal.service';
import { VoluntarioService } from '../../services/voluntario.service';
import { AreaService } from '../../services/area.service';
import { Area } from '../../models/area.model';
import { Animal } from '../../models/animal.model';
import { ESPECIE_LABELS, STATUS_LABELS } from '../../models/enums';
import { MODULOS, ModuloId } from '../../shared/modulos';
import { mensagemDeErro } from '../../shared/erro';
import { FUNCIONALIDADES, Funcionalidade, buscarFuncionalidades } from './funcionalidades';

interface Indicador {
  modulo: ModuloId;
  icone: string;
  valor: number;
  rotulo: string;
  rota: string;
  /** Mesmos filtros usados na contagem, para a lista abrir já filtrada. */
  queryParams?: Params;
}

const QTD_RESGATES_RECENTES = 5;
const MAX_RESULTADOS_BUSCA = 10;
const MODULOS_PESQUISAVEIS: ModuloId[] = [
  'animais',
  'adotantes',
  'voluntarios',
  'responsaveis',
  'racas',
  'areas',
];

@Component({
  selector: 'app-inicio',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
  host: { '(document:keydown)': 'focarBuscaComAtalho($event)' },
})
export class Inicio implements OnInit {
  private readonly animalService = inject(AnimalService);
  private readonly voluntarioService = inject(VoluntarioService);
  private readonly areaService = inject(AreaService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  private readonly campoBusca = viewChild<ElementRef<HTMLInputElement>>('campoBusca');

  readonly carregando = signal(false);
  readonly animais = signal<Animal[]>([]);
  readonly totalVoluntarios = signal(0);
  readonly areas = signal<Area[]>([]);

  readonly acoes = FUNCIONALIDADES.filter((f) => f.destaque);

  readonly termo = signal('');

  /** "Buscar “Rex” em Animais" etc. — abre a lista do módulo já com a busca preenchida. */
  readonly opcoesRegistro = computed<Funcionalidade[]>(() => {
    const termo = this.termo().trim();
    if (!termo) return [];
    return MODULOS_PESQUISAVEIS.map((id) => {
      const m = MODULOS[id];
      return {
        modulo: id,
        icone: m.icone,
        titulo: `Buscar “${termo}” em ${m.nome}`,
        descricao: `Procurar ${m.nome.toLowerCase()} pelo nome ou dados cadastrados`,
        rota: m.rota,
        queryParams: { busca: termo },
        palavrasChave: [],
        tipo: 'busca',
      };
    });
  });

  /** "Voluntários da área X": as áreas são cadastradas pelo usuário, então vêm da API. Só na busca. */
  readonly atalhosAreas = computed<Funcionalidade[]>(() =>
    this.areas().map((a) => ({
      modulo: 'areas',
      icone: 'workspaces',
      titulo: `Voluntários da área ${a.nome}`,
      descricao:
        a.voluntarios.length === 1 ? '1 voluntário' : `${a.voluntarios.length} voluntários`,
      rota: '/voluntarios',
      queryParams: { area: a.id },
      palavrasChave: [a.nome, 'área', 'voluntários'],
      tipo: 'atalho',
    })),
  );

  /** Campo vazio: todas as funcionalidades fora das ações rápidas. Digitando: as 10 melhores. */
  readonly resultadosBusca = computed(() => {
    const termo = this.termo();
    const encontradas = buscarFuncionalidades(termo, [...FUNCIONALIDADES, ...this.atalhosAreas()]);
    return termo.trim()
      ? encontradas.slice(0, MAX_RESULTADOS_BUSCA)
      : encontradas.filter((f) => !f.destaque);
  });

  private contarStatus(...status: Animal['status'][]): number {
    return this.animais().filter((a) => status.includes(a.status)).length;
  }

  /** Os números que mais orientam o dia a dia: adoção, cuidados e equipe. */
  readonly indicadores = computed<Indicador[]>(() => [
    {
      modulo: 'animais',
      icone: 'home_health',
      valor: this.contarStatus('DISPONIVEL'),
      rotulo: 'Disponíveis para adoção',
      rota: '/animais',
      queryParams: { status: 'DISPONIVEL' },
    },
    {
      modulo: 'animais',
      icone: 'medical_services',
      valor: this.contarStatus('EM_TRATAMENTO', 'QUARENTENA'),
      rotulo: 'Em tratamento ou quarentena',
      rota: '/animais',
      queryParams: { status: 'EM_TRATAMENTO,QUARENTENA' },
    },
    {
      modulo: 'animais',
      icone: 'favorite',
      valor: this.contarStatus('ADOTADO'),
      rotulo: 'Adotados',
      rota: '/animais',
      queryParams: { status: 'ADOTADO' },
    },
    {
      modulo: 'voluntarios',
      icone: 'volunteer_activism',
      valor: this.totalVoluntarios(),
      rotulo: 'Voluntários',
      rota: '/voluntarios',
    },
  ]);

  /** Últimos resgates pela data de resgate (ISO `yyyy-MM-dd` ordena como texto). */
  readonly resgatesRecentes = computed(() =>
    [...this.animais()]
      .sort((a, b) => (b.dataResgate ?? '').localeCompare(a.dataResgate ?? ''))
      .slice(0, QTD_RESGATES_RECENTES),
  );

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    forkJoin({
      animais: this.animalService.listar(),
      voluntarios: this.voluntarioService.listar(),
    }).subscribe({
      next: ({ animais, voluntarios }) => {
        this.animais.set(animais);
        this.totalVoluntarios.set(voluntarios.length);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.snackBar.open(mensagemDeErro(err), 'Fechar', { duration: 5000 });
      },
    });
    // Separado do forkJoin: sem as áreas, só somem os atalhos por área na busca.
    this.areaService.listar().subscribe({
      next: (areas) => this.areas.set(areas),
      error: () => this.areas.set([]),
    });
  }

  /** Abre a funcionalidade escolhida na busca e limpa o campo. */
  abrirFuncionalidade(evento: MatAutocompleteSelectedEvent): void {
    const f = evento.option.value as Funcionalidade;
    this.termo.set('');
    this.router.navigate([f.rota], { queryParams: f.queryParams });
  }

  /** O autocomplete guarda o objeto escolhido; no campo fica vazio. */
  exibirNada(): string {
    return '';
  }

  /** Atalho "/" foca a busca, exceto quando já se está digitando em algum campo. */
  focarBuscaComAtalho(evento: KeyboardEvent): void {
    if (evento.key !== '/') return;
    const alvo = evento.target as HTMLElement | null;
    if (alvo?.closest('input, textarea, select, [contenteditable="true"]')) return;
    evento.preventDefault();
    this.campoBusca()?.nativeElement.focus();
  }

  iconeTipo(f: Funcionalidade): string {
    return { cadastro: 'add', atalho: 'arrow_forward', busca: 'search' }[f.tipo];
  }

  rotuloStatus(animal: Animal): string {
    return STATUS_LABELS[animal.status] ?? animal.status;
  }

  inicial(animal: Animal): string {
    return animal.nome?.trim().charAt(0).toUpperCase() || '?';
  }

  descricao(animal: Animal): string {
    const especie = animal.raca?.especie?.nome;
    return (
      [especie && ESPECIE_LABELS[especie], animal.raca?.nome].filter(Boolean).join(' · ') || '—'
    );
  }

  data(iso: string | null | undefined): string {
    if (!iso) return '—';
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
  }
}
