import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { RacaService } from '../../../services/raca.service';
import { EspecieService } from '../../../services/especie.service';
import { Raca, RacaPayload } from '../../../models/raca.model';
import { Especie } from '../../../models/especie.model';
import { ESPECIE_LABELS } from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';

export interface RacaQuickCreateDialogData {
  especieIdSugerido: number | null;
}

@Component({
  selector: 'app-raca-quick-create-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './raca-quick-create-dialog.html',
  styleUrl: './raca-quick-create-dialog.scss',
})
export class RacaQuickCreateDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly racaService = inject(RacaService);
  private readonly especieService = inject(EspecieService);
  private readonly dialogRef = inject(MatDialogRef<RacaQuickCreateDialog, Raca>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly data = inject<RacaQuickCreateDialogData>(MAT_DIALOG_DATA);

  readonly especieLabels = ESPECIE_LABELS;
  readonly especies = signal<Especie[]>([]);
  readonly salvando = signal(false);

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(50)]],
    especieId: [this.data.especieIdSugerido, Validators.required],
  });

  ngOnInit(): void {
    this.especieService.listar().subscribe({
      next: (dados) => this.especies.set(dados),
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const payload: RacaPayload = {
      nome: v.nome!,
      especieId: v.especieId!,
    };

    this.salvando.set(true);
    this.racaService.salvar(payload).subscribe({
      next: (racaCriada) => {
        this.salvando.set(false);
        this.notificar('Raça cadastrada.');
        this.dialogRef.close(racaCriada);
      },
      error: (err) => {
        this.salvando.set(false);
        this.notificar(mensagemDeErro(err));
      },
    });
  }

  private notificar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
  }
}
