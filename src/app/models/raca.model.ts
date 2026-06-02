import { Especie } from './especie.model';

export interface Raca {
  id: number;
  nome: string;
  // Presente nas respostas de leitura da API; ao enviar, basta o `id`.
  especie?: Especie;
}
