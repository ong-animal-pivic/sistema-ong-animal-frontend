import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AnimalService } from '../../../services/animal.service';
import { Animal } from '../../../models/animal.model';
import { Raca } from '../../../models/raca.model';
import {
  AnimalEspecie,
  AnimalStatus,
  ANIMAL_ESPECIES,
  ANIMAL_STATUS,
  PORTE_LABELS,
  SEXO_LABELS,
  STATUS_LABELS,
} from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { AnimalDeleteDialog } from '../animal-delete-dialog/animal-delete-dialog';

type Visao = 'cards' | 'tabela';
const VISAO_KEY = 'animais:visao';

@Component({
  selector: 'app-animal-list',
  imports: [
    RouterLink,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './animal-list.html',
  styleUrl: './animal-list.scss',
})
export class AnimalList implements OnInit {
  private readonly service = inject(AnimalService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly animais = signal<Animal[]>([]);
  readonly carregando = signal(false);
  readonly visao = signal<Visao>(this.lerVisaoSalva());
  readonly colunas = ['animal', 'especie', 'porte', 'status', 'acoes'];

  /* Filtros */
  readonly statusOptions = ANIMAL_STATUS;
  readonly especieOptions = ANIMAL_ESPECIES;
  readonly filtroStatus = signal<AnimalStatus | ''>('');
  readonly filtroEspecie = signal<AnimalEspecie | ''>('');

  readonly animaisFiltrados = computed(() => {
    let lista = this.animais();
    const status = this.filtroStatus();
    const especie = this.filtroEspecie();
    if (status) {
      lista = lista.filter((a) => a.status === status);
    }
    if (especie) {
      lista = lista.filter(
        (a) => (a.raca as Raca)?.especie?.nome === especie,
      );
    }
    return lista;
  });

  readonly total = computed(() => this.animais().length);
  readonly disponiveis = computed(
    () => this.animais().filter((a) => a.status === 'DISPONIVEL').length,
  );
  readonly adotados = computed(
    () => this.animais().filter((a) => a.status === 'ADOTADO').length,
  );

  ngOnInit(): void {
    this.carregar();
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

  /** Inicial do nome do animal para o avatar. */
  inicial(animal: Animal): string {
    return animal.nome?.trim().charAt(0).toUpperCase() || '?';
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
