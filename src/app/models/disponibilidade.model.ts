import { DiaSemana, Turno } from './enums';

/**
 * Espelha o DisponibilidadeResponseDTO. `id` é o da Disponibilidade (combinação
 * dia/turno), não o do vínculo — é ele que vai no DELETE. A observação pertence
 * ao vínculo com o voluntário; não há PUT, então trocá-la exige remover e readicionar.
 */
export interface Disponibilidade {
  id: number;
  diaSemana: DiaSemana;
  turno: Turno;
  observacao?: string | null;
}

export interface DisponibilidadePayload {
  diaSemana: DiaSemana;
  turno: Turno;
  observacao?: string | null;
}
