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
      // Busca o primeiro erro de fato renderizado, na ordem do DOM: `<mat-error>`
      // (erro de campo, ou de grupo exibido num campo via `ErroDeGrupoMatcher`)
      // ou `.bloco__erro` (erro de grupo exibido no bloco, ex.: CPF/CNPJ). Os
      // templates só colocam esses elementos no DOM quando a mensagem deve
      // aparecer, então refletem exatamente o que o usuário vê.
      const primeiroErroVisivel = formElement.querySelector<HTMLElement>('mat-error, .bloco__erro');
      if (!primeiroErroVisivel) {
        return;
      }

      const alvoDoScroll = primeiroErroVisivel.matches('.bloco__erro')
        ? (primeiroErroVisivel.closest<HTMLElement>('fieldset') ?? primeiroErroVisivel)
        : (primeiroErroVisivel.closest<HTMLElement>('mat-form-field') ?? primeiroErroVisivel);
      const inputs = Array.from(alvoDoScroll.querySelectorAll<HTMLInputElement>('input'));
      const campoComErro = inputs.find((i) => !i.value) ?? inputs[0] ?? alvoDoScroll;

      alvoDoScroll.scrollIntoView({ behavior: 'smooth', block: 'center' });
      campoComErro.focus({ preventScroll: true });
    });
  });
}
