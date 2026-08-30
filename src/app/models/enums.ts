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

export const ESPECIE_LABELS: Record<AnimalEspecie, string> = {
  GATO: 'Gato',
  CACHORRO: 'Cachorro',
};

// --- Adotante ---

export type EstadoCivil =
  | 'SOLTEIRO'
  | 'CASADO'
  | 'DIVORCIADO'
  | 'VIUVO'
  | 'SEPARADO_JUDICIALMENTE';

export type Escolaridade =
  | 'FUNDAMENTAL_INCOMPLETO'
  | 'FUNDAMENTAL_COMPLETO'
  | 'MEDIO_INCOMPLETO'
  | 'MEDIO_COMPLETO'
  | 'SUPERIOR_INCOMPLETO'
  | 'SUPERIOR_CURSANDO'
  | 'SUPERIOR_COMPLETO'
  | 'POS_GRADUACAO'
  | 'MESTRADO'
  | 'DOUTORADO';

export const ESTADOS_CIVIS: Opcao<EstadoCivil>[] = [
  { value: 'SOLTEIRO', label: 'Solteiro(a)' },
  { value: 'CASADO', label: 'Casado(a)' },
  { value: 'DIVORCIADO', label: 'Divorciado(a)' },
  { value: 'VIUVO', label: 'Viúvo(a)' },
  { value: 'SEPARADO_JUDICIALMENTE', label: 'Separado(a) judicialmente' },
];

export const ESCOLARIDADES: Opcao<Escolaridade>[] = [
  { value: 'FUNDAMENTAL_INCOMPLETO', label: 'Fundamental incompleto' },
  { value: 'FUNDAMENTAL_COMPLETO', label: 'Fundamental completo' },
  { value: 'MEDIO_INCOMPLETO', label: 'Médio incompleto' },
  { value: 'MEDIO_COMPLETO', label: 'Médio completo' },
  { value: 'SUPERIOR_INCOMPLETO', label: 'Superior incompleto' },
  { value: 'SUPERIOR_CURSANDO', label: 'Superior cursando' },
  { value: 'SUPERIOR_COMPLETO', label: 'Superior completo' },
  { value: 'POS_GRADUACAO', label: 'Pós-graduação' },
  { value: 'MESTRADO', label: 'Mestrado' },
  { value: 'DOUTORADO', label: 'Doutorado' },
];

export const ESTADO_CIVIL_LABELS: Record<EstadoCivil, string> =
  Object.fromEntries(
    ESTADOS_CIVIS.map((o) => [o.value, o.label]),
  ) as Record<EstadoCivil, string>;

export const ESCOLARIDADE_LABELS: Record<Escolaridade, string> =
  Object.fromEntries(
    ESCOLARIDADES.map((o) => [o.value, o.label]),
  ) as Record<Escolaridade, string>;

// --- Cores (texto livre com sugestões; espelham o limite length=20 do backend) ---

export const CORES_PELAGEM: string[] = [
  'Preto',
  'Branco',
  'Caramelo',
  'Marrom',
  'Cinza',
  'Tigrado',
  'Malhado',
  'Tricolor',
  'Dourado',
];

export const CORES_OLHOS: string[] = [
  'Castanho',
  'Mel',
  'Azul',
  'Verde',
  'Âmbar',
  'Preto',
  'Heterocromia',
];
