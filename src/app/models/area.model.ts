/** Espelha o VoluntarioResumoResponseDTO: só o necessário para listar e linkar. */
export interface VoluntarioResumo {
  id: number;
  nome: string;
}

/** Espelha o AreaResponseDTO do backend. `voluntarios` vem sempre preenchido. */
export interface Area {
  id: number;
  nome: string;
  descricao?: string | null;
  observacao?: string | null;
  voluntarios: VoluntarioResumo[];
}

// Corpo de escrita (POST/PUT). Os vínculos com voluntários têm endpoints próprios.
export interface AreaPayload {
  nome: string;
  descricao?: string | null;
  observacao?: string | null;
}
