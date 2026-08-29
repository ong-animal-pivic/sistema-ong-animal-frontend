/** Formata idadeMeses como "N meses", "N anos" ou "N anos e M meses". */
export function formatarIdade(totalMeses: number): string {
  const anos = Math.floor(totalMeses / 12);
  const meses = totalMeses % 12;

  if (anos === 0) {
    return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  }
  if (meses === 0) {
    return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
  }
  return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
}
