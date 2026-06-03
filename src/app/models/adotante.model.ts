import { EstadoCivil, Escolaridade } from './enums';

/**
 * Espelha a entidade Adotante do backend (objetos embutidos: documento,
 * contato, endereco, dadosDemograficos). Datas trafegam como string ISO
 * `yyyy-MM-dd`. Em `Animal`, ao enviar (POST/PUT) basta `{ id }`.
 */
export interface Documento {
  cpf: string;
  rg: string;
  orgaoRg: string;
}

export interface Contato {
  telefonePrincipal: string;
  telefoneSecundario: string;
  email?: string | null;
  instagram?: string | null;
}

export interface Endereco {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  numero: string;
  complemento?: string | null;
}

export interface DadosDemograficos {
  profissao?: string | null;
  rendaMensal: number;
  estadoCivil?: EstadoCivil | null;
  escolaridade?: Escolaridade | null;
}

export interface Adotante {
  id?: number;
  nome: string;
  dataNascimento: string;
  documento: Documento;
  contato: Contato;
  endereco: Endereco;
  dadosDemograficos: DadosDemograficos;
}
