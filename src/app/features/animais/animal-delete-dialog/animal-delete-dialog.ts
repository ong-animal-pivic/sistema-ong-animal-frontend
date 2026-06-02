import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-animal-delete-dialog',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Excluir animal</h2>
    <mat-dialog-content>
      Tem certeza que deseja excluir <strong>{{ data.nome }}</strong>?
      Esta ação não pode ser desfeita.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">
        Excluir
      </button>
    </mat-dialog-actions>
  `,
})
export class AnimalDeleteDialog {
  readonly data = inject<{ nome: string }>(MAT_DIALOG_DATA);
}
