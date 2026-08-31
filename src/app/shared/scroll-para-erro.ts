/** Rola a tela até o primeiro campo inválido do form e dá foco nele. */
export function scrollParaPrimeiroErro(formElement: HTMLElement | null): void {
  if (!formElement) {
    return;
  }

  // Aguarda o próximo paint para garantir que os `<mat-error>` (aplicados em
  // resposta a `markAllAsTouched()`) já estejam no DOM — um `setTimeout(0)`
  // sozinho não garante isso em app zoneless.
  requestAnimationFrame(() => {
    setTimeout(() => {
      // Busca o primeiro `<mat-error>` de fato renderizado: os templates só
      // colocam esse elemento no DOM via `@if`/`@else if` quando a mensagem
      // deve aparecer, então ele reflete exatamente o que o usuário vê —
      // tanto para erro de campo quanto para erro de grupo (ex.: dois
      // telefones iguais, que só invalida o grupo, mas exibe a mensagem num
      // campo específico).
      const primeiroErroVisivel = formElement.querySelector<HTMLElement>('mat-error');
      if (!primeiroErroVisivel) {
        return;
      }

      const alvoDoScroll =
        primeiroErroVisivel.closest<HTMLElement>('mat-form-field') ?? primeiroErroVisivel;
      const campoComErro =
        alvoDoScroll.querySelector<HTMLElement>('[formControlName]') ?? alvoDoScroll;

      alvoDoScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
      campoComErro.focus({ preventScroll: true });
    });
  });
}
