/** Corpo de erro no padrão RFC 7807 retornado pela API (ProblemDetail). */
export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  /** Mapa campo -> mensagem usado nos erros de validação do backend. */
  detalhes?: Record<string, string>;
}
