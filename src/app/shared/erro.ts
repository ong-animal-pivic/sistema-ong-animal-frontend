import { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetail } from '../models/problem-detail';

/** Mapa de nomes de campo técnicos para nomes amigáveis em português. */
const NOMES_CAMPOS: Record<string, string> = {
  nome: 'Nome',
  dataNascimento: 'Data de nascimento',
  cpf: 'CPF',
  rg: 'RG',
  orgaoRg: 'Órgão emissor',
  telefonePrincipal: 'Telefone principal',
  telefoneSecundario: 'Telefone secundário',
  email: 'E-mail',
  instagram: 'Instagram',
  logradouro: 'Logradouro',
  numero: 'Número',
  complemento: 'Complemento',
  bairro: 'Bairro',
  cidade: 'Cidade',
  estado: 'Estado',
  cep: 'CEP',
  profissao: 'Profissão',
  rendaMensal: 'Renda mensal',
  estadoCivil: 'Estado civil',
  escolaridade: 'Escolaridade',
  especie: 'Espécie',
  raca: 'Raça',
  status: 'Status',
  dataEntrada: 'Data de entrada',
  dataSaida: 'Data de saída',
  nomeAnimal: 'Nome do animal',
};

/** Traduz um nome de campo técnico para um rótulo legível. */
function traduzirCampo(campo: string): string {
  // Remove prefixos de objeto aninhado (ex: "documento.cpf" → "cpf")
  const partes = campo.split('.');
  const chave = partes[partes.length - 1];
  return NOMES_CAMPOS[chave] ?? campo;
}

/** Extrai uma mensagem legível a partir de um erro HTTP da API. */
export function mensagemDeErro(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão e se o sistema está disponível.';
    }

    const corpo = err.error as ProblemDetail | undefined;

    // Erros de validação com detalhes por campo
    if (corpo?.detalhes) {
      const campos = Object.entries(corpo.detalhes).map(
        ([campo, msg]) => `${traduzirCampo(campo)}: ${msg}`,
      );
      if (campos.length) return campos.join(' • ');
    }

    // Mensagem detalhada do backend
    if (corpo?.detail) return corpo.detail;

    // Título genérico do erro
    if (corpo?.title) return corpo.title;

    // Fallback por status HTTP
    switch (err.status) {
      case 400:
        return 'Os dados enviados são inválidos. Verifique os campos e tente novamente.';
      case 404:
        return 'O registro solicitado não foi encontrado.';
      case 409:
        return 'Já existe um registro com esses dados. Verifique as informações duplicadas.';
      case 422:
        return 'Não foi possível processar a solicitação. Verifique os dados informados.';
      case 500:
        return 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.';
      default:
        return `Erro inesperado (código ${err.status}). Tente novamente.`;
    }
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}
