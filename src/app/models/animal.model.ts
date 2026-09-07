import { AnimalPorte, AnimalSexo, AnimalStatus } from './enums';
import { Raca } from './raca.model';
import { Adotante } from './adotante.model';
import { Responsavel } from './responsavel.model';

/**
 * Espelha o AnimalResponseDTO do backend: `raca`, `adotante` e `responsavel`
 * vêm sempre como objetos completos. Datas trafegam como string ISO
 * `yyyy-MM-dd`.
 */
export interface Animal {
  id?: number;
  nome: string;
  idadeMeses: number;
  porte: AnimalPorte;
  sexo: AnimalSexo;
  status: AnimalStatus;
  castrado: boolean;
  dataResgate: string;
  dataSaida?: string | null;
  corOlhos?: string | null;
  corPelagem?: string | null;
  observacao?: string | null;
  raca: Raca;
  adotante?: Adotante | null;
  responsavel: Responsavel;
}

/**
 * Espelha o AnimalRequestDTO do backend (corpo de POST/PUT): `racaId`,
 * `adotanteId` e `responsavelId` são ids escalares na raiz do payload, não
 * objetos aninhados.
 */
export interface AnimalPayload {
  nome: string;
  idadeMeses: number;
  porte: AnimalPorte;
  sexo: AnimalSexo;
  status: AnimalStatus;
  castrado: boolean;
  dataResgate: string;
  dataSaida?: string | null;
  corOlhos?: string | null;
  corPelagem?: string | null;
  observacao?: string | null;
  racaId: number;
  adotanteId?: number | null;
  responsavelId: number;
}
