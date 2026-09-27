// Módulos do sistema — fonte única de nome, ícone e rota usados no menu, na
// barra de contexto (trilha) e na tela inicial. A cor de cada módulo vem dos
// tokens `--modulo-cor*` definidos em `styles.scss` por `[data-modulo]`.

export type ModuloId =
  | 'inicio'
  | 'animais'
  | 'adotantes'
  | 'racas'
  | 'responsaveis'
  | 'voluntarios'
  | 'areas';

export interface Modulo {
  id: ModuloId;
  nome: string;
  icone: string;
  rota: string;
}

export const MODULOS: Record<ModuloId, Modulo> = {
  inicio: { id: 'inicio', nome: 'Início', icone: 'home', rota: '/' },
  animais: { id: 'animais', nome: 'Animais', icone: 'pets', rota: '/animais' },
  adotantes: { id: 'adotantes', nome: 'Adotantes', icone: 'group', rota: '/adotantes' },
  racas: { id: 'racas', nome: 'Raças', icone: 'category', rota: '/racas' },
  responsaveis: {
    id: 'responsaveis',
    nome: 'Responsáveis',
    icone: 'badge',
    rota: '/responsaveis',
  },
  voluntarios: {
    id: 'voluntarios',
    nome: 'Voluntários',
    icone: 'volunteer_activism',
    rota: '/voluntarios',
  },
  areas: { id: 'areas', nome: 'Áreas', icone: 'workspaces', rota: '/areas' },
};

/** Ordem de exibição no menu principal. */
export const MODULOS_MENU: Modulo[] = [
  MODULOS.inicio,
  MODULOS.animais,
  MODULOS.adotantes,
  MODULOS.racas,
  MODULOS.responsaveis,
  MODULOS.voluntarios,
  MODULOS.areas,
];

/** Dados de rota lidos pelo shell para montar a identidade visual da página. */
export interface DadosRotaModulo {
  modulo: ModuloId;
  pagina?: 'Novo' | 'Editar' | 'Detalhe';
}
