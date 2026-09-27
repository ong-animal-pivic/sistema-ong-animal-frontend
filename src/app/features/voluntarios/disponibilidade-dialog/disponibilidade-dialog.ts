import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { DIA_SEMANA_LABELS, TURNO_LABELS } from '../../../models/enums';
import { Disponibilidade } from '../../../models/disponibilidade.model';

export interface DisponibilidadeDialogData {
  /** Horários já marcados na grade; só eles podem receber observação. */
  marcadas: Disponibilidade[];
  /** Horário pré-selecionado (ao editar a partir da lista de observações). */
  selecionada?: Disponibilidade;
}

export interface DisponibilidadeDialogResult {
  disponibilidade: Disponibilidade;
  observacao: string | null;
}

/** Adiciona ou edita a observação de um horário já marcado; fecha retornando o resultado. */
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
    <h2 mat-dialog-title>{{ titulo() }}</h2>
    <form [formGroup]="form" (ngSubmit)="confirmar()">
      <mat-dialog-content>
        <mat-form-field appearance="outline">
          <mat-label>Horário</mat-label>
          <mat-select formControlName="disponibilidade">
            @for (d of data.marcadas; track d.id) {
              <mat-option [value]="d">{{ descrever(d) }}</mat-option>
            }
          </mat-select>
          @if (form.controls.disponibilidade.hasError('required')) {
            <mat-error>Selecione o horário.</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Observação</mat-label>
          <textarea matInput formControlName="observacao" rows="3" maxlength="255"></textarea>
          <mat-hint align="end">{{ form.controls.observacao.value?.length ?? 0 }}/255</mat-hint>
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button color="primary" type="submit">Salvar</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [
    `
      mat-form-field {
        width: 100%;
      }
      mat-dialog-content {
        padding-top: 4px;
      }
      mat-dialog-actions {
        gap: 10px;
      }
      mat-dialog-actions button {
        border-radius: 999px;
        padding: 0 20px;
        font-weight: 600;
      }
    `,
  ],
})
export class DisponibilidadeDialog {
  readonly data = inject<DisponibilidadeDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(
    MatDialogRef<DisponibilidadeDialog, DisponibilidadeDialogResult>,
  );
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    disponibilidade: [this.data.selecionada ?? null, Validators.required],
    observacao: [this.data.selecionada?.observacao ?? '', Validators.maxLength(255)],
  });

  private readonly selecionada = toSignal(this.form.controls.disponibilidade.valueChanges, {
    initialValue: this.form.controls.disponibilidade.value,
  });

  readonly titulo = computed(() =>
    this.selecionada()?.observacao ? 'Editar observação' : 'Adicionar observação',
  );

  constructor() {
    // Ao trocar o horário, carrega a observação que ele já tem (ou limpa o campo).
    this.form.controls.disponibilidade.valueChanges.subscribe((d) =>
      this.form.controls.observacao.setValue(d?.observacao ?? ''),
    );
  }

  descrever(d: Disponibilidade): string {
    return `${DIA_SEMANA_LABELS[d.diaSemana]} · ${TURNO_LABELS[d.turno]}`;
  }

  confirmar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.dialogRef.close({
      disponibilidade: v.disponibilidade!,
      observacao: v.observacao?.trim() || null,
    });
  }
}
