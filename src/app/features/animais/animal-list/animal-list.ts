import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AnimalService } from '../../../services/animal.service';
import { RacaService } from '../../../services/raca.service';
import { AdotanteService } from '../../../services/adotante.service';
import { Animal } from '../../../models/animal.model';
import { Raca } from '../../../models/raca.model';
import { Adotante } from '../../../models/adotante.model';
import { Responsavel } from '../../../models/responsavel.model';
import {
  AnimalEspecie,
  AnimalPorte,
  AnimalSexo,
  AnimalStatus,
  ANIMAL_ESPECIES,
  ANIMAL_PORTES,
  ANIMAL_SEXOS,
  ANIMAL_STATUS,
  PORTE_LABELS,
  SEXO_LABELS,
  STATUS_LABELS,
} from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { formatarIdade } from '../../../shared/idade';
import { contemTexto } from '../../../shared/busca';
import { AnimalDeleteDialog } from '../animal-delete-dialog/animal-delete-dialog';

type Visao = 'cards' | 'tabela';
const VISAO_KEY = 'animais:visao';

@Component({
  selector: 'app-animal-list',
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './animal-list.html',
  styleUrl: './animal-list.scss',
})
export class AnimalList implements OnInit {
  private readonly service = inject(AnimalService);
  private readonly racaService = inject(RacaService);
  private readonly adotanteService = inject(AdotanteService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly animais = signal<Animal[]>([]);
  readonly racas = signal<Raca[]>([]);
  readonly adotantes = signal<Adotante[]>([]);
  readonly carregando = signal(false);
  readonly visao = signal<Visao>(this.lerVisaoSalva());
  readonly termo = signal('');
  readonly colunas = ['animal', 'especie', 'porte', 'responsavel', 'status', 'acoes'];

  readonly opcoesEspecie = ANIMAL_ESPECIES;
  readonly opcoesStatus = ANIMAL_STATUS;
  readonly opcoesSexo = ANIMAL_SEXOS;
  readonly opcoesPorte = ANIMAL_PORTES;

  readonly filtroEspecie = signal<AnimalEspecie[]>([]);
  readonly filtroRacaId = signal<number[]>([]);
  readonly filtroStatus = signal<AnimalStatus[]>([]);
  readonly filtroCastrado = signal<boolean[]>([]);
  readonly filtroSexo = signal<AnimalSexo[]>([]);
  readonly filtroPorte = signal<AnimalPorte[]>([]);
  readonly filtroAdotanteId = signal<number[]>([]);

  readonly total = computed(() => this.animais().length);
  readonly disponiveis = computed(
    () => this.animais().filter((a) => a.status === 'DISPONIVEL').length,
  );
  readonly adotados = computed(
    () => this.animais().filter((a) => a.status === 'ADOTADO').length,
  );

  readonly racasFiltradas = computed(() => {
    const especies = this.filtroEspecie();
    return especies.length === 0
      ? this.racas()
      : this.racas().filter((r) => r.especie?.nome && especies.includes(r.especie.nome));
  });

  readonly filtrosAtivos = computed(
    () =>
      this.filtroEspecie().length > 0 ||
      this.filtroRacaId().length > 0 ||
      this.filtroStatus().length > 0 ||
      this.filtroCastrado().length > 0 ||
      this.filtroSexo().length > 0 ||
      this.filtroPorte().length > 0 ||
      this.filtroAdotanteId().length > 0,
  );

  readonly itensFiltrados = computed(() => {
    const especies = this.filtroEspecie();
    const racaIds = this.filtroRacaId();
    const status = this.filtroStatus();
    const castrado = this.filtroCastrado();
    const sexos = this.filtroSexo();
    const portes = this.filtroPorte();
    const adotanteIds = this.filtroAdotanteId();

    return this.animais().filter(
      (a) =>
        this.corresponde(a, this.termo()) &&
        (especies.length === 0 ||
          (!!a.raca?.especie?.nome && especies.includes(a.raca.especie.nome))) &&
        (racaIds.length === 0 || (!!a.raca?.id && racaIds.includes(a.raca.id))) &&
        (status.length === 0 || status.includes(a.status)) &&
        (castrado.length === 0 || castrado.includes(a.castrado)) &&
        (sexos.length === 0 || sexos.includes(a.sexo)) &&
        (portes.length === 0 || portes.includes(a.porte)) &&
        (adotanteIds.length === 0 || (!!a.adotante?.id && adotanteIds.includes(a.adotante.id))),
    );
  });
  readonly totalFiltrado = computed(() => this.itensFiltrados().length);

  readonly mostrarFiltroAdotante = computed(() => this.filtroStatus().includes('ADOTADO'));

  constructor() {
    effect(() => {
      const idsValidos = new Set(this.racasFiltradas().map((r) => r.id));
      const racaIds = this.filtroRacaId();
      const filtrados = racaIds.filter((id) => idsValidos.has(id));
      if (filtrados.length !== racaIds.length) {
        this.filtroRacaId.set(filtrados);
      }
    });

    effect(() => {
      if (!this.mostrarFiltroAdotante() && this.filtroAdotanteId().length > 0) {
        this.filtroAdotanteId.set([]);
      }
    });
  }

  ngOnInit(): void {
    this.carregar();
    this.carregarRacas();
    this.carregarAdotantes();
  }

  limparFiltros(): void {
    this.filtroEspecie.set([]);
    this.filtroRacaId.set([]);
    this.filtroStatus.set([]);
    this.filtroCastrado.set([]);
    this.filtroSexo.set([]);
    this.filtroPorte.set([]);
    this.filtroAdotanteId.set([]);
  }

  definirVisao(v: Visao): void {
    this.visao.set(v);
    localStorage.setItem(VISAO_KEY, v);
  }

  private lerVisaoSalva(): Visao {
    return localStorage.getItem(VISAO_KEY) === 'tabela' ? 'tabela' : 'cards';
  }

  rotuloPorte(animal: Animal): string {
    return PORTE_LABELS[animal.porte] ?? animal.porte;
  }

  rotuloSexo(animal: Animal): string {
    return SEXO_LABELS[animal.sexo] ?? animal.sexo;
  }

  rotuloStatus(animal: Animal): string {
    return STATUS_LABELS[animal.status] ?? animal.status;
  }

  nomeRaca(animal: Animal): string {
    return (animal.raca as Raca)?.nome ?? '—';
  }

  nomeEspecie(animal: Animal): string {
    return (animal.raca as Raca)?.especie?.nome ?? '—';
  }

  nomeResponsavel(animal: Animal): string {
    return (animal.responsavel as Responsavel)?.nome ?? '—';
  }

  /** Inicial do nome do animal para o avatar. */
  inicial(animal: Animal): string {
    return animal.nome?.trim().charAt(0).toUpperCase() || '?';
  }

  rotuloIdade(animal: Animal): string {
    return formatarIdade(animal.idadeMeses);
  }

  private corresponde(animal: Animal, termo: string): boolean {
    return (
      contemTexto(animal.nome, termo) ||
      contemTexto(this.nomeEspecie(animal), termo) ||
      contemTexto(this.nomeRaca(animal), termo) ||
      contemTexto(this.rotuloStatus(animal), termo)
    );
  }

  carregar(): void {
    this.carregando.set(true);
    this.service.listar().subscribe({
      next: (dados) => {
        this.animais.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.notificar(mensagemDeErro(err));
      },
    });
  }

  private carregarRacas(): void {
    this.racaService.listar().subscribe({
      next: (dados) => this.racas.set(dados),
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private carregarAdotantes(): void {
    this.adotanteService.listar().subscribe({
      next: (dados) => this.adotantes.set(dados),
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  confirmarExclusao(animal: Animal): void {
    const ref = this.dialog.open(AnimalDeleteDialog, {
      data: { nome: animal.nome },
      width: '420px',
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) this.excluir(animal);
    });
  }

  private excluir(animal: Animal): void {
    this.service.excluir(animal.id!).subscribe({
      next: () => {
        this.notificar(`"${animal.nome}" foi excluído.`);
        this.carregar();
      },
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private notificar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
  }
}
