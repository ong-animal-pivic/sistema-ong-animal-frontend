import { Opcao } from './enums';

/** Salário mínimo de referência (R$) usado para classificar a renda mensal em faixas. */
export const SALARIO_MINIMO = 1518;

export type FaixaRenda = 'ATE_1_SM' | 'DE_1_A_3_SM' | 'DE_3_A_5_SM' | 'ACIMA_5_SM';

export type FaixaEtaria = 'DE_21_A_30' | 'DE_31_A_45' | 'DE_46_A_60' | 'ACIMA_60';

export const FAIXAS_RENDA: Opcao<FaixaRenda>[] = [
  { value: 'ATE_1_SM', label: 'Até 1 SM' },
  { value: 'DE_1_A_3_SM', label: 'De 1 a 3 SM' },
  { value: 'DE_3_A_5_SM', label: 'De 3 a 5 SM' },
  { value: 'ACIMA_5_SM', label: 'Acima de 5 SM' },
];

export const FAIXAS_ETARIAS: Opcao<FaixaEtaria>[] = [
  { value: 'DE_21_A_30', label: '21 a 30 anos' },
  { value: 'DE_31_A_45', label: '31 a 45 anos' },
  { value: 'DE_46_A_60', label: '46 a 60 anos' },
  { value: 'ACIMA_60', label: 'Acima de 60 anos' },
];

/**
 * Classifica uma renda mensal (R$) em faixa de salários mínimos (SM = R$ 1.518,00).
 * Limites: até 1 SM = R$ 1.518,00; 1–3 SM = R$ 1.518,01 a R$ 4.554,00;
 * 3–5 SM = R$ 4.554,01 a R$ 7.590,00; acima de 5 SM = > R$ 7.590,00.
 */
export function classificarFaixaRenda(rendaMensal: number): FaixaRenda {
  if (rendaMensal <= SALARIO_MINIMO * 1) return 'ATE_1_SM';
  if (rendaMensal <= SALARIO_MINIMO * 3) return 'DE_1_A_3_SM';
  if (rendaMensal <= SALARIO_MINIMO * 5) return 'DE_3_A_5_SM';
  return 'ACIMA_5_SM';
}

/**
 * Classifica uma idade (anos completos) em faixa etária. Retorna `null` quando a
 * idade não se encaixa em nenhuma faixa (ex.: menor de 21 anos) — nesse caso o
 * adotante nunca corresponde a nenhum valor selecionado no filtro de faixa etária.
 */
export function classificarFaixaEtaria(idade: number): FaixaEtaria | null {
  if (idade >= 21 && idade <= 30) return 'DE_21_A_30';
  if (idade >= 31 && idade <= 45) return 'DE_31_A_45';
  if (idade >= 46 && idade <= 60) return 'DE_46_A_60';
  if (idade > 60) return 'ACIMA_60';
  return null;
}
