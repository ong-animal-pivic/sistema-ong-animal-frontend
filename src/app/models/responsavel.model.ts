import { Contato, Endereco } from './adotante.model';
import { Tipo } from './tipo.model';
import { Animal } from './animal.model';

/**
 * Documento de Responsável: diferente de Adotante, o CPF aqui é opcional
 * (mutuamente exclusivo com `cnpj`, na raiz de `Responsavel`).
 */
export interface DocumentoResponsavel {
  cpf?: string | null;
  rg?: string | null;
  orgaoRg?: string | null;
}

/**
 * Espelha o ResponsavelResponseDTO do backend. `tipo` vem sempre como objeto
 * completo. `animaisVinculados` só é preenchido no GET /responsaveis/{id}
 * (vem `null`/ausente no GET /responsaveis, que retorna a lista).
 * `qtdAnimais` é somente leitura: calculado dinamicamente pelo backend
 * (COUNT de animais vinculados), não existe mais como coluna gravável — vem
 * `null` quando o objeto aparece aninhado (ex.: dentro de Animal.responsavel).
 */
export interface Responsavel {
  id?: number;
  nome: string;
  documento: DocumentoResponsavel;
  cnpj?: string | null;
  contato: Contato;
  endereco: Endereco;
  qtdAnimais?: number | null;
  tipo: Tipo;
  animaisVinculados?: Animal[] | null;
}

// Corpo de escrita (POST/PUT): o backend espera o id do tipo como campo escalar.
// `qtdAnimais` não entra aqui — é calculado dinamicamente pelo backend (COUNT em Animal), não é mais uma coluna gravável.
export interface ResponsavelPayload {
  nome: string;
  documento: DocumentoResponsavel;
  cnpj?: string | null;
  contato: Contato;
  endereco: Endereco;
  tipoId: number;
}
