import { AnimalPorte, AnimalSexo, AnimalStatus } from './enums';
import { Raca } from './raca.model';
import { Adotante } from './adotante.model';

/**
 * Espelha a entidade Animal do backend. Nas respostas de leitura, `raca` e
 * `adotante` vêm como objetos completos; ao enviar (POST/PUT), basta `{ id }`.
 * Datas trafegam como string ISO `yyyy-MM-dd`.
 */
export interface Animal {
  id?: number;
  nome: string;
  idade: number;
  porte: AnimalPorte;
  sexo: AnimalSexo;
  status: AnimalStatus;
  castrado: boolean;
  dataResgate: string;
  dataSaida?: string | null;
  corOlhos?: string | null;
  corPelagem?: string | null;
  observacao?: string | null;
  raca: Raca | { id: number };
  adotante?: Adotante | { id: number } | null;
}
