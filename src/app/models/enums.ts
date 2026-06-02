// Espelha os enums do backend (valores enviados/recebidos pela API em maiúsculas).

export type AnimalPorte = 'PEQUENO' | 'MEDIO' | 'GRANDE';
export type AnimalSexo = 'MACHO' | 'FEMEA';
export type AnimalStatus =
  | 'DISPONIVEL'
  | 'ADOTADO'
  | 'EM_TRATAMENTO'
  | 'QUARENTENA'
  | 'OBITO';
export type AnimalEspecie = 'GATO' | 'CACHORRO';

export interface Opcao<T> {
  value: T;
  label: string;
}

export const ANIMAL_PORTES: Opcao<AnimalPorte>[] = [
  { value: 'PEQUENO', label: 'Pequeno' },
  { value: 'MEDIO', label: 'Médio' },
  { value: 'GRANDE', label: 'Grande' },
];

export const ANIMAL_SEXOS: Opcao<AnimalSexo>[] = [
  { value: 'MACHO', label: 'Macho' },
  { value: 'FEMEA', label: 'Fêmea' },
];

export const ANIMAL_STATUS: Opcao<AnimalStatus>[] = [
  { value: 'DISPONIVEL', label: 'Disponível' },
  { value: 'ADOTADO', label: 'Adotado' },
  { value: 'EM_TRATAMENTO', label: 'Em tratamento' },
  { value: 'QUARENTENA', label: 'Quarentena' },
  { value: 'OBITO', label: 'Óbito' },
];

export const PORTE_LABELS: Record<AnimalPorte, string> = Object.fromEntries(
  ANIMAL_PORTES.map((o) => [o.value, o.label]),
) as Record<AnimalPorte, string>;

export const SEXO_LABELS: Record<AnimalSexo, string> = Object.fromEntries(
  ANIMAL_SEXOS.map((o) => [o.value, o.label]),
) as Record<AnimalSexo, string>;

export const STATUS_LABELS: Record<AnimalStatus, string> = Object.fromEntries(
  ANIMAL_STATUS.map((o) => [o.value, o.label]),
) as Record<AnimalStatus, string>;
