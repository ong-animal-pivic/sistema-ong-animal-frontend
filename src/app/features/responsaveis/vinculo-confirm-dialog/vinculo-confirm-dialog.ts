import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface VinculoConfirmData {
  animal: string;
  responsavelAtual: string;
  responsavelNovo: string;
}

@Component({
  selector: 'app-vinculo-confirm-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog">
      <span class="dialog__icone"><mat-icon>add_link</mat-icon></span>
      <h2 mat-dialog-title>Vincular animal?</h2>
      <mat-dialog-content>
        O animal <strong>{{ data.animal }}</strong> está sob os cuidados de
        <strong>{{ data.responsavelAtual }}</strong>. Deseja vinculá-lo a
        <strong>{{ data.responsavelNovo }}</strong>?
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button mat-dialog-close>Cancelar</button>
        <button mat-flat-button color="primary" [mat-dialog-close]="true">Vincular</button>
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
        background: var(--brand-teal-soft, #e2f5f2);
        color: var(--brand-teal, #1f9e8f);
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
    `,
  ],
})
export class VinculoConfirmDialog {
  readonly data = inject<VinculoConfirmData>(MAT_DIALOG_DATA);
}
