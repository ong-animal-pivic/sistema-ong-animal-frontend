import { Directive, ElementRef, Input, Renderer2, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { MASCARAS, TipoMascara, extrairRaw } from './mascara';

/**
 * Aplica máscara visual (CPF, RG, telefone, CEP) num `<input>` de reactive form,
 * mantendo apenas os dígitos crus (sem pontuação) como valor do FormControl —
 * é o que o backend espera. Substitui o `DefaultValueAccessor` para evitar a
 * disputa entre os dois listeners de `input` no mesmo elemento.
 */
@Directive({
  selector: 'input[appMascara]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MascaraDirective),
      multi: true,
    },
  ],
  host: {
    '(input)': 'aoDigitar($event)',
    '(blur)': 'aoSairDoCampo()',
  },
})
export class MascaraDirective implements ControlValueAccessor {
  @Input('appMascara') tipo!: TipoMascara;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private readonly el: ElementRef<HTMLInputElement>,
    private readonly renderer: Renderer2,
  ) {}

  aoDigitar(evento: Event): void {
    const valorDigitado = (evento.target as HTMLInputElement).value;
    const raw = extrairRaw(this.tipo, valorDigitado);
    this.escreverNoElemento(raw);
    this.onChange(raw);
  }

  aoSairDoCampo(): void {
    this.onTouched();
  }

  writeValue(value: string | null): void {
    const raw = extrairRaw(this.tipo, value ?? '');
    this.escreverNoElemento(raw);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.el.nativeElement, 'disabled', isDisabled);
  }

  private escreverNoElemento(raw: string): void {
    const mascarado = MASCARAS[this.tipo](raw);
    this.renderer.setProperty(this.el.nativeElement, 'value', mascarado);
  }
}
