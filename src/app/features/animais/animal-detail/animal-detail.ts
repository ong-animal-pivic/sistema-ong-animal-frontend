import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AnimalService } from '../../../services/animal.service';
import { Animal } from '../../../models/animal.model';
import {
  ESPECIE_LABELS,
  PORTE_LABELS,
  SEXO_LABELS,
  STATUS_LABELS,
  TIPO_RESPONSAVEL_LABELS,
} from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { formatarIdade } from '../../../shared/idade';
import { AnimalDeleteDialog } from '../animal-delete-dialog/animal-delete-dialog';

@Component({
  selector: 'app-animal-detail',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressBarModule, MatDialogModule],
  templateUrl: './animal-detail.html',
  styleUrl: './animal-detail.scss',
})
export class AnimalDetail implements OnInit {
  private readonly service = inject(AnimalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly animal = signal<Animal | null>(null);
  readonly carregando = signal(false);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/animais']);
      return;
    }
    this.carregar(Number(idParam));
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.service.buscarPorId(id).subscribe({
      next: (a) => {
        this.animal.set(a);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.notificar(mensagemDeErro(err));
        this.router.navigate(['/animais']);
      },
    });
  }

  especie(a: Animal): string {
    const nome = a.raca?.especie?.nome;
    return nome ? ESPECIE_LABELS[nome] : '—';
  }

  raca(a: Animal): string {
    return a.raca?.nome ?? '—';
  }

  rotuloStatus(a: Animal): string {
    return STATUS_LABELS[a.status] ?? a.status;
  }

  rotuloPorte(a: Animal): string {
    return PORTE_LABELS[a.porte] ?? a.porte;
  }

  rotuloSexo(a: Animal): string {
    return SEXO_LABELS[a.sexo] ?? a.sexo;
  }

  idade(a: Animal): string {
    return formatarIdade(a.idadeMeses);
  }

  tipoResponsavel(a: Animal): string {
    const nome = a.responsavel?.tipo?.nome;
    return nome ? TIPO_RESPONSAVEL_LABELS[nome] : '';
  }

  /** Converte `yyyy-MM-dd` em `dd/MM/yyyy`. */
  data(iso: string | null | undefined): string {
    if (!iso) return '—';
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
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
        this.router.navigate(['/animais']);
      },
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private notificar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
  }
}
