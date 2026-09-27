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
      // Exibe só a mensagem: o caminho do campo (ex.: "documento.cpf") é detalhe técnico.
      const mensagens = [...new Set(Object.values(corpo.detalhes))];
      if (mensagens.length) return mensagens.join(' • ');
    }
    if (corpo?.detail) return corpo.detail;
    if (corpo?.title) return corpo.title;
  }
  return 'Ocorreu um erro inesperado.';
}
