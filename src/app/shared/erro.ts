import { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetail } from '../models/problem-detail';

/** Extrai uma mensagem legível a partir de um erro HTTP da API. */
export function mensagemDeErro(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Não foi possível conectar à API. Verifique se o backend está rodando.';
    }
    const corpo = err.error as ProblemDetail | undefined;
    if (corpo?.detalhes) {
      const campos = Object.entries(corpo.detalhes).map(
        ([campo, msg]) => `${campo}: ${msg}`,
      );
      if (campos.length) return campos.join(' • ');
    }
    if (corpo?.detail) return corpo.detail;
    if (corpo?.title) return corpo.title;
  }
  return 'Ocorreu um erro inesperado.';
}
