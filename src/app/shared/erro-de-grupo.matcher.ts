import { AbstractControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

/**
 * Exibe o campo em estado de erro também quando o erro está no grupo pai
 * (ex.: `telefonesIguais`), que não invalida o controle em si — sem isso o
 * `<mat-error>` do campo nunca é renderizado.
 */
export class ErroDeGrupoMatcher implements ErrorStateMatcher {
  constructor(private readonly erroDoGrupo: string) {}

  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    if (!control) {
      return false;
    }
    const invalido = control.invalid || !!control.parent?.hasError(this.erroDoGrupo);
    return invalido && (control.touched || !!form?.submitted);
  }
}
