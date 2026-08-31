/** true se `valor` contém `termo` (case-insensitive); termo vazio sempre casa. */
export function contemTexto(valor: string | null | undefined, termo: string): boolean {
  const t = termo.trim().toLowerCase();
  if (!t) return true;
  return (valor ?? '').toLowerCase().includes(t);
}
