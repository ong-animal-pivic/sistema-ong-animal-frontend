import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { RacaService } from '../../../services/raca.service';
import { Raca } from '../../../models/raca.model';
import { Especie } from '../../../models/especie.model';
import {
  ANIMAL_ESPECIES,
  AnimalEspecie,
} from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { RacaDeleteDialog } from '../raca-delete-dialog/raca-delete-dialog';

@Component({
  selector: 'app-raca-list',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './raca-list.html',
  styleUrl: './raca-list.scss',
})
export class RacaList implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly racaService = inject(RacaService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly especies = ANIMAL_ESPECIES;
  readonly todasRacas = signal<Raca[]>([]);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly editandoId = signal<number | null>(null);
  readonly filtroEspecie = signal<AnimalEspecie | ''>('');

  readonly racasFiltradas = computed(() => {
    const filtro = this.filtroEspecie();
    const todas = this.todasRacas();
    if (!filtro) return todas;
    return todas.filter((r) => r.especie?.nome === filtro);
  });

  readonly colunas = ['especie', 'nome', 'acoes'];

  readonly form = this.fb.group({
    especie: [null as AnimalEspecie | null, Validators.required],
    nome: ['', [Validators.required, Validators.maxLength(50)]],
  });

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.racaService.listar().subscribe({
      next: (dados) => {
        this.todasRacas.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.notificar(mensagemDeErro(err));
      },
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const especieId = v.especie === 'CACHORRO' ? 1 : 2;
    const payload = { nome: v.nome!, especie: { id: especieId } };

    this.salvando.set(true);
    const id = this.editandoId();
    const req = id
      ? this.racaService.atualizar(id, payload)
      : this.racaService.salvar(payload);

    req.subscribe({
      next: () => {
        this.salvando.set(false);
        this.notificar(id ? 'Raça atualizada.' : 'Raça cadastrada.');
        this.limparForm();
        this.carregar();
      },
      error: (err) => {
        this.salvando.set(false);
        this.notificar(mensagemDeErro(err));
      },
    });
  }

  editar(raca: Raca): void {
    this.editandoId.set(raca.id);
    this.form.patchValue({
      especie: (raca.especie as Especie)?.nome ?? null,
      nome: raca.nome,
    });
  }

  cancelarEdicao(): void {
    this.limparForm();
  }

  confirmarExclusao(raca: Raca): void {
    const ref = this.dialog.open(RacaDeleteDialog, {
      data: { nome: raca.nome },
      width: '420px',
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) this.excluir(raca);
    });
  }

  nomeEspecie(raca: Raca): string {
    const nome = (raca.especie as Especie)?.nome;
    if (!nome) return '—';
    return nome === 'CACHORRO' ? 'Cachorro' : nome === 'GATO' ? 'Gato' : nome;
  }

  private excluir(raca: Raca): void {
    this.racaService.excluir(raca.id).subscribe({
      next: () => {
        this.notificar(`"${raca.nome}" foi excluída.`);
        this.carregar();
      },
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private limparForm(): void {
    this.editandoId.set(null);
    this.form.reset();
  }

  private notificar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
  }
}
