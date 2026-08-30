import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';

import { apenasDigitos, formatarData } from './mascara';

/**
 * Aplica máscara visual de data (dd/mm/aaaa) num `<input [matDatepicker]>`.
 * Diferente de `MascaraDirective`, não implementa `ControlValueAccessor` — quem
 * controla o valor do FormControl continua sendo o `MatDatepickerInput` nativo.
 * O listener é registrado em fase de captura para reescrever `input.value` com
 * as barras ANTES do listener do Material (fase de bubble) ler o valor digitado.
 */
@Directive({
  selector: 'input[appMascaraData]',
  standalone: true,
})
export class MascaraDataDirective implements OnInit, OnDestroy {
  constructor(private readonly el: ElementRef<HTMLInputElement>) {}

  ngOnInit(): void {
    this.el.nativeElement.addEventListener('input', this.aoDigitar, true);
  }

  ngOnDestroy(): void {
    this.el.nativeElement.removeEventListener('input', this.aoDigitar, true);
  }

  private aoDigitar = (evento: Event): void => {
    const input = evento.target as HTMLInputElement;
    const cursorOriginal = input.selectionStart ?? input.value.length;
    const digitosAntesDoCursor = apenasDigitos(input.value.slice(0, cursorOriginal)).length;

    const mascarado = formatarData(input.value);
    input.value = mascarado;

    const novaPosicao = this.posicaoAposNDigitos(mascarado, digitosAntesDoCursor);
    input.setSelectionRange(novaPosicao, novaPosicao);
  };

  private posicaoAposNDigitos(texto: string, n: number): number {
    if (n <= 0) return 0;
    let contados = 0;
    for (let i = 0; i < texto.length; i++) {
      if (/\d/.test(texto[i])) {
        contados++;
        if (contados === n) return i + 1;
      }
    }
    return texto.length;
  }
}
