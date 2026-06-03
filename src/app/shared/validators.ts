import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Valida se o CPF informado possui exatamente 11 dígitos numéricos
 * e se os dígitos verificadores estão corretos.
 */
export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = (control.value ?? '').replace(/\D/g, '');

    if (!valor) return null; // deixar o `required` cuidar de campo vazio

    if (valor.length !== 11) {
      return { cpfInvalido: true };
    }

    // Rejeita sequências de dígitos iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(valor)) {
      return { cpfInvalido: true };
    }

    // Cálculo dos dígitos verificadores
    const digitos = valor.split('').map(Number);

    for (let j = 0; j < 2; j++) {
      let soma = 0;
      for (let i = 0; i < 9 + j; i++) {
        soma += digitos[i] * (10 + j - i);
      }
      let resto = (soma * 10) % 11;
      if (resto === 10) resto = 0;
      if (resto !== digitos[9 + j]) {
        return { cpfInvalido: true };
      }
    }

    return null;
  };
}

/**
 * Valida se a data informada corresponde a uma pessoa com pelo menos
 * `idadeMinima` anos (padrão: 18).
 */
export function idadeMinimaValidator(idadeMinima = 18): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const data: Date | null = control.value;

    if (!data) return null; // deixar o `required` cuidar de campo vazio

    const hoje = new Date();
    const nascimento = new Date(data);

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();
    const mesNascimento = nascimento.getMonth();
    const diaNascimento = nascimento.getDate();

    if (
      mesAtual < mesNascimento ||
      (mesAtual === mesNascimento && diaAtual < diaNascimento)
    ) {
      idade--;
    }

    if (idade < idadeMinima) {
      return { menorDeIdade: { idadeMinima, idadeAtual: idade } };
    }

    return null;
  };
}
