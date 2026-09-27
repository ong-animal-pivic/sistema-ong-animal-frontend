import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { DiaSemana, DIAS_SEMANA, Turno, TURNOS } from '../../../models/enums';
import { DisponibilidadePayload } from '../../../models/disponibilidade.model';

export interface DisponibilidadeDialogData {
  /** Combinações já cadastradas, no formato `DIA|TURNO`; ficam indisponíveis para seleção. */
  ocupadas: string[];
}

/** Adiciona uma disponibilidade com observação; fecha retornando o payload. */
@Component({
  selector: 'app-disponibilidade-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Adicionar disponibilidade</h2>
    <form [formGroup]="form" (ngSubmit)="confirmar()">
      <mat-dialog-content>
        <div class="grade">
          <mat-form-field appearance="outline">
            <mat-label>Dia da semana</mat-label>
            <mat-select formControlName="diaSemana">
              @for (d of dias; track d.value) {
                <mat-option [value]="d.value" [disabled]="diaLotado(d.value)">
                  {{ d.label }}
                </mat-option>
              }
            </mat-select>
            @if (form.controls.diaSemana.hasError('required')) {
              <mat-error>Selecione o dia.</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Turno</mat-label>
            <mat-select formControlName="turno">
              @for (t of turnos; track t.value) {
                <mat-option [value]="t.value" [disabled]="ocupada(diaSelecionado(), t.value)">
                  {{ t.label }}
                </mat-option>
              }
            </mat-select>
            @if (form.controls.turno.hasError('required')) {
              <mat-error>Selecione o turno.</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Observação</mat-label>
          <textarea matInput formControlName="observacao" rows="3" maxlength="255"></textarea>
          <mat-hint align="end">{{ form.controls.observacao.value?.length ?? 0 }}/255</mat-hint>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button color="primary" type="submit">Adicionar</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      .grade {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0 12px;
        padding-top: 4px;
      }
      mat-form-field {
        width: 100%;
      }
      mat-dialog-actions {
        gap: 10px;
      }
      mat-dialog-actions button {
        border-radius: 999px;
        padding: 0 20px;
        font-weight: 600;
      }
      @media (max-width: 480px) {
        .grade {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DisponibilidadeDialog {
  private readonly data = inject<DisponibilidadeDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<DisponibilidadeDialog, DisponibilidadePayload>);
  private readonly fb = inject(FormBuilder);
  private readonly ocupadas = new Set(this.data.ocupadas);

  readonly dias = DIAS_SEMANA;
  readonly turnos = TURNOS;

  readonly form = this.fb.group({
    diaSemana: [null as DiaSemana | null, Validators.required],
    turno: [null as Turno | null, Validators.required],
    observacao: ['', Validators.maxLength(255)],
  });

  readonly diaSelecionado = toSignal(this.form.controls.diaSemana.valueChanges, {
    initialValue: null,
  });

  constructor() {
    // Ao trocar o dia, descarta o turno se a combinação já estiver cadastrada.
    this.form.controls.diaSemana.valueChanges.subscribe((dia) => {
      const turno = this.form.controls.turno.value;
      if (dia && turno && this.ocupada(dia, turno)) this.form.controls.turno.setValue(null);
    });
  }

  ocupada(dia: DiaSemana | null, turno: Turno): boolean {
    return !!dia && this.ocupadas.has(`${dia}|${turno}`);
  }

  diaLotado(dia: DiaSemana): boolean {
    return this.turnos.every((t) => this.ocupada(dia, t.value));
  }

  confirmar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.dialogRef.close({
      diaSemana: v.diaSemana!,
      turno: v.turno!,
      observacao: v.observacao?.trim() || null,
    });
  }
}
