/** Rola a tela até o primeiro campo inválido do form e dá foco nele. */
export function scrollParaPrimeiroErro(formElement: HTMLElement | null): void {
  if (!formElement) {
    return;
  }

  // Aguarda o próximo ciclo de change detection para os `<mat-error>` já
  // estarem renderizados quando o scroll acontecer.
  setTimeout(() => {
    // Campos com erro próprio (ex.: obrigatório vazio) têm prioridade; na
    // ausência deles, busca um controle dentro de um grupo com erro de
    // validação cruzada (ex.: dois telefones iguais), que só marca o grupo.
    const campoInvalido =
      formElement.querySelector<HTMLElement>('.ng-invalid[formControlName]') ??
      formElement.querySelector<HTMLElement>('.ng-invalid[formGroupName] [formControlName]');
    if (!campoInvalido) {
      return;
    }

    const alvoDoScroll = campoInvalido.closest<HTMLElement>('mat-form-field') ?? campoInvalido;
    alvoDoScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
    campoInvalido.focus();
  });
}
