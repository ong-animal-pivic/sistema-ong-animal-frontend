import { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetail } from '../models/problem-detail';

/** Nomes legíveis dos campos da API, indexados pelo último segmento do caminho (ex.: "documento.cpf" → "cpf"). */
const ROTULOS_CAMPOS: Record<string, string> = {
  nome: 'Nome',
  cpf: 'CPF/CIN',
  rg: 'RG',
  orgaoRg: 'Órgão emissor do RG',
  cnpj: 'CNPJ',
  dataNascimento: 'Data de nascimento',
  telefonePrincipal: 'Telefone principal',
  telefoneSecundario: 'Telefone secundário',
  email: 'E-mail',
  instagram: 'Instagram',
  cep: 'CEP',
  logradouro: 'Logradouro',
  numero: 'Número',
  complemento: 'Complemento',
  bairro: 'Bairro',
  cidade: 'Cidade',
  estado: 'Estado',
  profissao: 'Profissão',
  rendaMensal: 'Renda mensal',
  estadoCivil: 'Estado civil',
  escolaridade: 'Escolaridade',
  qtdAnimais: 'Quantidade de animais',
  especieId: 'Espécie',
  racaId: 'Raça',
  tipoId: 'Tipo',
  responsavelId: 'Responsável',
  adotanteId: 'Adotante',
  sexo: 'Sexo',
  porte: 'Porte',
  castrado: 'Castrado',
  corPelagem: 'Cor da pelagem',
  corOlhos: 'Cor dos olhos',
  dataResgate: 'Data de resgate',
  dataSaida: 'Data de saída',
  status: 'Status',
  idade: 'Idade',
  idadeMeses: 'Idade',
  descricao: 'Descrição',
  observacao: 'Observação',
  diaSemana: 'Dia da semana',
  turno: 'Turno',
  frequencia: 'Frequência',
};

/** Converte o caminho técnico de um campo da API em um nome legível. */
function rotuloDoCampo(caminho: string): string {
  const segmento = caminho.split('.').pop()!.replace(/\[\d+\]/g, '');
  if (ROTULOS_CAMPOS[segmento]) return ROTULOS_CAMPOS[segmento];
  const palavras = segmento.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  return palavras.charAt(0).toUpperCase() + palavras.slice(1);
}

/** Extrai uma mensagem legível a partir de um erro HTTP da API. */
export function mensagemDeErro(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Não foi possível conectar à API. Verifique se o backend está rodando.';
    }
    const corpo = err.error as ProblemDetail | undefined;
    if (corpo?.detalhes) {
      const campos = Object.entries(corpo.detalhes).map(
        ([campo, msg]) => `${rotuloDoCampo(campo)}: ${msg}`,
      );
      if (campos.length) return campos.join(' • ');
    }
    if (corpo?.detail) return corpo.detail;
    if (corpo?.title) return corpo.title;
  }
  return 'Ocorreu um erro inesperado.';
}
