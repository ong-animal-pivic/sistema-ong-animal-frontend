import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-raca-delete-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog">
      <span class="dialog__icone"><mat-icon>delete</mat-icon></span>
      <h2 mat-dialog-title>Excluir {{ data.nome }}?</h2>
      <mat-dialog-content>
        Esta ação é permanente e não pode ser desfeita.
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button mat-dialog-close>Cancelar</button>
        <button mat-flat-button class="dialog__excluir" [mat-dialog-close]="true">
          Excluir
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .dialog {
        text-align: center;
        padding: 8px 4px;
      }
      .dialog__icone {
        display: grid;
        place-items: center;
        width: 56px;
        height: 56px;
        border-radius: 18px;
        margin: 4px auto 12px;
        background: var(--brand-coral-soft, #ffeae6);
        color: var(--brand-coral-strong, #f0503f);
      }
      .dialog__icone mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
      h2 {
        font-weight: 700;
      }
      mat-dialog-content {
        color: var(--brand-muted, #6b7785);
      }
      mat-dialog-actions {
        justify-content: center;
        gap: 10px;
        padding-bottom: 8px;
      }
      mat-dialog-actions button {
        border-radius: 999px;
        padding: 0 20px;
        font-weight: 600;
      }
      .dialog__excluir {
        background: var(--brand-coral-strong, #f0503f);
        color: #fff;
      }
    `,
  ],
})
export class RacaDeleteDialog {
  readonly data = inject<{ nome: string }>(MAT_DIALOG_DATA);
}
