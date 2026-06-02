import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AnimalService } from '../../../services/animal.service';
import { Animal } from '../../../models/animal.model';
import { Raca } from '../../../models/raca.model';
import { PORTE_LABELS, STATUS_LABELS } from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { AnimalDeleteDialog } from '../animal-delete-dialog/animal-delete-dialog';

@Component({
  selector: 'app-animal-list',
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
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
  readonly colunas = ['nome', 'especie', 'raca', 'porte', 'status', 'acoes'];

  rotuloPorte(animal: Animal): string {
    return PORTE_LABELS[animal.porte] ?? animal.porte;
  }

  rotuloStatus(animal: Animal): string {
    return STATUS_LABELS[animal.status] ?? animal.status;
  }

  ngOnInit(): void {
    this.carregar();
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

  nomeRaca(animal: Animal): string {
    return (animal.raca as Raca)?.nome ?? '—';
  }

  nomeEspecie(animal: Animal): string {
    return (animal.raca as Raca)?.especie?.nome ?? '—';
  }

  confirmarExclusao(animal: Animal): void {
    const ref = this.dialog.open(AnimalDeleteDialog, {
      data: { nome: animal.nome },
      width: '400px',
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
