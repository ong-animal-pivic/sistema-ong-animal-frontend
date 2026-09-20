import { Contato, Endereco } from './adotante.model';
import { DocumentoResponsavel, Responsavel } from './responsavel.model';
import { FrequenciaVoluntario } from './enums';

/**
 * Espelha o VoluntarioResponseDTO do backend. `responsavel` vem sempre como
 * objeto completo (ResponsavelResponseDTO aninhado). Documento reaproveita
 * `DocumentoResponsavel` porque, assim como em Responsável, o CPF é opcional
 * (diferente de Adotante, onde é obrigatório).
 */
export interface Voluntario {
  id?: number;
  nome: string;
  documento: DocumentoResponsavel;
  idade?: number | null;
  profissao?: string | null;
  contato: Contato;
  frequencia: FrequenciaVoluntario;
  endereco: Endereco;
  responsavel: Responsavel;
}

// Corpo de escrita (POST/PUT): o backend espera o id do responsável como campo escalar.
export interface VoluntarioPayload {
  nome: string;
  documento: DocumentoResponsavel;
  idade?: number | null;
  profissao?: string | null;
  contato: Contato;
  frequencia: FrequenciaVoluntario;
  endereco: Endereco;
  responsavelId: number;
}
