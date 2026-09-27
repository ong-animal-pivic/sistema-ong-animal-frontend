import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

import { AnimalService } from '../../services/animal.service';
import { AdotanteService } from '../../services/adotante.service';
import { VoluntarioService } from '../../services/voluntario.service';
import { ResponsavelService } from '../../services/responsavel.service';
import { Animal } from '../../models/animal.model';
import { ESPECIE_LABELS, STATUS_LABELS } from '../../models/enums';
import { ModuloId } from '../../shared/modulos';
import { mensagemDeErro } from '../../shared/erro';

interface AcaoRapida {
  modulo: ModuloId;
  icone: string;
  titulo: string;
  descricao: string;
  rota: string;
}

interface Indicador {
  modulo: ModuloId;
  icone: string;
  valor: number;
  rotulo: string;
  rota: string;
}

const QTD_RESGATES_RECENTES = 5;

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio implements OnInit {
  private readonly animalService = inject(AnimalService);
  private readonly adotanteService = inject(AdotanteService);
  private readonly voluntarioService = inject(VoluntarioService);
  private readonly responsavelService = inject(ResponsavelService);
  private readonly snackBar = inject(MatSnackBar);

  readonly carregando = signal(false);
  readonly animais = signal<Animal[]>([]);
  readonly totalAdotantes = signal(0);
  readonly totalVoluntarios = signal(0);
  readonly totalResponsaveis = signal(0);

  readonly acoes: AcaoRapida[] = [
    {
      modulo: 'animais',
      icone: 'pets',
      titulo: 'Cadastrar animal',
      descricao: 'Registrar um novo resgate',
      rota: '/animais/novo',
    },
    {
      modulo: 'adotantes',
      icone: 'group_add',
      titulo: 'Novo adotante',
      descricao: 'Cadastrar quem vai adotar',
      rota: '/adotantes/novo',
    },
    {
      modulo: 'voluntarios',
      icone: 'volunteer_activism',
      titulo: 'Novo voluntário',
      descricao: 'Incluir alguém na equipe',
      rota: '/voluntarios/novo',
    },
    {
      modulo: 'responsaveis',
      icone: 'badge',
      titulo: 'Novo responsável',
      descricao: 'Abrigo, lar temporário ou protetor',
      rota: '/responsaveis/novo',
    },
  ];

  private contarStatus(...status: Animal['status'][]): number {
    return this.animais().filter((a) => status.includes(a.status)).length;
  }

  readonly indicadores = computed<Indicador[]>(() => [
    {
      modulo: 'animais',
      icone: 'home_health',
      valor: this.contarStatus('DISPONIVEL'),
      rotulo: 'Disponíveis para adoção',
      rota: '/animais',
    },
    {
      modulo: 'animais',
      icone: 'favorite',
      valor: this.contarStatus('ADOTADO'),
      rotulo: 'Adotados',
      rota: '/animais',
    },
    {
      modulo: 'animais',
      icone: 'medical_services',
      valor: this.contarStatus('EM_TRATAMENTO', 'QUARENTENA'),
      rotulo: 'Em tratamento ou quarentena',
      rota: '/animais',
    },
    {
      modulo: 'adotantes',
      icone: 'group',
      valor: this.totalAdotantes(),
      rotulo: 'Adotantes',
      rota: '/adotantes',
    },
    {
      modulo: 'voluntarios',
      icone: 'volunteer_activism',
      valor: this.totalVoluntarios(),
      rotulo: 'Voluntários',
      rota: '/voluntarios',
    },
    {
      modulo: 'responsaveis',
      icone: 'badge',
      valor: this.totalResponsaveis(),
      rotulo: 'Responsáveis',
      rota: '/responsaveis',
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
      adotantes: this.adotanteService.listar(),
      voluntarios: this.voluntarioService.listar(),
      responsaveis: this.responsavelService.listar(),
    }).subscribe({
      next: ({ animais, adotantes, voluntarios, responsaveis }) => {
        this.animais.set(animais);
        this.totalAdotantes.set(adotantes.length);
        this.totalVoluntarios.set(voluntarios.length);
        this.totalResponsaveis.set(responsaveis.length);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.snackBar.open(mensagemDeErro(err), 'Fechar', { duration: 5000 });
      },
    });
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
