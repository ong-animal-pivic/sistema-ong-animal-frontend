export type TipoMascara = 'cpf' | 'rg' | 'telefone' | 'cep';

/** Remove tudo que não é dígito. */
export function apenasDigitos(valor: string): string {
  return (valor ?? '').replace(/\D/g, '');
}

export function formatarCpf(raw: string): string {
  const digitos = apenasDigitos(raw).slice(0, 11);
  let resultado = digitos.slice(0, 3);
  if (digitos.length > 3) resultado += `.${digitos.slice(3, 6)}`;
  if (digitos.length > 6) resultado += `.${digitos.slice(6, 9)}`;
  if (digitos.length > 9) resultado += `-${digitos.slice(9, 11)}`;
  return resultado;
}

/** RG: 9 caracteres, o último pode ser o dígito verificador `X`. */
export function formatarRg(raw: string): string {
  const semTraco = (raw ?? '').toUpperCase().replace(/[^0-9X]/g, '');
  const digitos = semTraco.slice(0, 9);
  let resultado = digitos.slice(0, 2);
  if (digitos.length > 2) resultado += `.${digitos.slice(2, 5)}`;
  if (digitos.length > 5) resultado += `.${digitos.slice(5, 8)}`;
  if (digitos.length > 8) resultado += `-${digitos.slice(8, 9)}`;
  return resultado;
}

/** Telefone: 10 dígitos → (XX) XXXX-XXXX; 11 dígitos (celular) → (XX) XXXXX-XXXX. */
export function formatarTelefone(raw: string): string {
  const digitos = apenasDigitos(raw).slice(0, 11);
  if (digitos.length === 0) return '';

  let resultado = `(${digitos.slice(0, 2)}`;
  if (digitos.length <= 2) return resultado;

  resultado += ') ';
  const ehCelular = digitos.length > 10;
  const tamanhoPrimeiroBloco = ehCelular ? 5 : 4;
  const primeiroBloco = digitos.slice(2, 2 + tamanhoPrimeiroBloco);
  resultado += primeiroBloco;

  const segundoBloco = digitos.slice(2 + tamanhoPrimeiroBloco);
  if (segundoBloco.length > 0) resultado += `-${segundoBloco}`;

  return resultado;
}

export function formatarCep(raw: string): string {
  const digitos = apenasDigitos(raw).slice(0, 8);
  let resultado = digitos.slice(0, 5);
  if (digitos.length > 5) resultado += `-${digitos.slice(5, 8)}`;
  return resultado;
}

/** Data: dd/mm/aaaa. */
export function formatarData(raw: string): string {
  const digitos = apenasDigitos(raw).slice(0, 8);
  let resultado = digitos.slice(0, 2);
  if (digitos.length > 2) resultado += `/${digitos.slice(2, 4)}`;
  if (digitos.length > 4) resultado += `/${digitos.slice(4, 8)}`;
  return resultado;
}

export const MASCARAS: Record<TipoMascara, (raw: string) => string> = {
  cpf: formatarCpf,
  rg: formatarRg,
  telefone: formatarTelefone,
  cep: formatarCep,
};

/** Extrai o valor "cru" (sem pontuação) de acordo com o tipo de máscara. */
export function extrairRaw(tipo: TipoMascara, valor: string): string {
  if (tipo === 'rg') return (valor ?? '').toUpperCase().replace(/[^0-9X]/g, '').slice(0, 9);
  if (tipo === 'telefone') return apenasDigitos(valor).slice(0, 11);
  if (tipo === 'cpf') return apenasDigitos(valor).slice(0, 11);
  return apenasDigitos(valor).slice(0, 8);
}
