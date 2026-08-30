import { Especie } from './especie.model';

export interface Raca {
  id: number;
  nome: string;
  // Presente nas respostas de leitura da API; ao enviar, basta o `id`.
  especie?: Especie;
}

// Corpo de escrita (POST/PUT): o backend espera o id da espécie como campo escalar.
export interface RacaPayload {
  nome: string;
  especieId: number;
}
