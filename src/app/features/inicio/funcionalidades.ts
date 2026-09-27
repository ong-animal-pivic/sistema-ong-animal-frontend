import { Params } from '@angular/router';
import { ModuloId } from '../../shared/modulos';

/**
 * Catálogo do que dá para fazer no sistema. Alimenta a busca da tela inicial
 * e as ações rápidas (itens com `destaque`). Atalhos filtrados usam os query
 * params lidos pelas listas (`shared/filtros-url.ts`).
 */
export interface Funcionalidade {
  modulo: ModuloId;
  icone: string;
  titulo: string;
  descricao: string;
  rota: string;
  queryParams?: Params;
  palavrasChave: string[];
  /** Cadastro (ícone "+"), atalho de navegação ("→") ou busca de registro (lupa). */
  tipo: 'cadastro' | 'atalho' | 'busca';
  destaque?: boolean;
}

export const FUNCIONALIDADES: Funcionalidade[] = [
  // --- Cadastros ---
  {
    modulo: 'animais',
    icone: 'pets',
    titulo: 'Cadastrar animal',
    descricao: 'Registrar um novo resgate',
    rota: '/animais/novo',
    palavrasChave: ['novo animal', 'resgate', 'resgatado', 'cachorro', 'gato', 'incluir'],
    tipo: 'cadastro',
    destaque: true,
  },
  {
    modulo: 'adotantes',
    icone: 'group_add',
    titulo: 'Novo adotante',
    descricao: 'Cadastrar quem vai adotar',
    rota: '/adotantes/novo',
    palavrasChave: ['adoção', 'adotar', 'cadastrar adotante', 'pessoa', 'tutor'],
    tipo: 'cadastro',
    destaque: true,
  },
  {
    modulo: 'voluntarios',
    icone: 'volunteer_activism',
    titulo: 'Novo voluntário',
    descricao: 'Incluir alguém na equipe',
    rota: '/voluntarios/novo',
    palavrasChave: ['cadastrar voluntário', 'equipe', 'ajudante'],
    tipo: 'cadastro',
    destaque: true,
  },
  {
    modulo: 'responsaveis',
    icone: 'badge',
    titulo: 'Novo responsável',
    descricao: 'Abrigo, lar temporário ou protetor',
    rota: '/responsaveis/novo',
    palavrasChave: ['cadastrar responsável', 'abrigo', 'lar temporário', 'LT', 'protetor', 'ONG'],
    tipo: 'cadastro',
    destaque: true,
  },

  // --- Atalhos com filtro ---
  {
    modulo: 'animais',
    icone: 'home_health',
    titulo: 'Animais disponíveis',
    descricao: 'Prontos para adoção',
    rota: '/animais',
    queryParams: { status: 'DISPONIVEL' },
    palavrasChave: ['disponível', 'adoção', 'adotar', 'feira de adoção'],
    tipo: 'atalho',
  },
  {
    modulo: 'animais',
    icone: 'medical_services',
    titulo: 'Em tratamento ou quarentena',
    descricao: 'Animais que precisam de cuidados',
    rota: '/animais',
    queryParams: { status: 'EM_TRATAMENTO,QUARENTENA' },
    palavrasChave: ['tratamento', 'quarentena', 'saúde', 'doente', 'veterinário', 'cuidados'],
    tipo: 'atalho',
  },
  {
    modulo: 'animais',
    icone: 'content_cut',
    titulo: 'Animais não castrados',
    descricao: 'Para planejar castrações',
    rota: '/animais',
    queryParams: { castrado: 'false' },
    palavrasChave: ['castração', 'castrar', 'castrado', 'mutirão'],
    tipo: 'atalho',
  },
  {
    modulo: 'animais',
    icone: 'content_cut',
    titulo: 'Disponíveis ainda não castrados',
    descricao: 'Castrar antes de liberar para adoção',
    rota: '/animais',
    queryParams: { status: 'DISPONIVEL', castrado: 'false' },
    palavrasChave: ['castração', 'castrar', 'pré-adoção', 'adoção', 'pendente'],
    tipo: 'atalho',
  },
  {
    modulo: 'animais',
    icone: 'female',
    titulo: 'Fêmeas não castradas',
    descricao: 'Prioridade para evitar novas ninhadas',
    rota: '/animais',
    queryParams: { sexo: 'FEMEA', castrado: 'false' },
    palavrasChave: ['fêmea', 'castração', 'castrar', 'ninhada', 'cio', 'prenhe'],
    tipo: 'atalho',
  },
  {
    modulo: 'animais',
    icone: 'coronavirus',
    titulo: 'Animais em quarentena',
    descricao: 'Recém-resgatados em isolamento',
    rota: '/animais',
    queryParams: { status: 'QUARENTENA' },
    palavrasChave: ['quarentena', 'isolamento', 'recém-resgatado', 'saúde'],
    tipo: 'atalho',
  },
  {
    modulo: 'animais',
    icone: 'hourglass_top',
    titulo: 'Disponíveis de grande porte',
    descricao: 'Costumam esperar mais por um lar',
    rota: '/animais',
    queryParams: { status: 'DISPONIVEL', porte: 'GRANDE' },
    palavrasChave: ['grande', 'porte', 'adoção', 'divulgação', 'campanha'],
    tipo: 'atalho',
  },
  {
    modulo: 'animais',
    icone: 'campaign',
    titulo: 'Cachorros para adoção',
    descricao: 'Cães disponíveis — útil para divulgação',
    rota: '/animais',
    queryParams: { status: 'DISPONIVEL', especie: 'CACHORRO' },
    palavrasChave: ['cão', 'cães', 'cachorro', 'adoção', 'divulgação', 'feira'],
    tipo: 'atalho',
  },
  {
    modulo: 'animais',
    icone: 'campaign',
    titulo: 'Gatos para adoção',
    descricao: 'Gatos disponíveis — útil para divulgação',
    rota: '/animais',
    queryParams: { status: 'DISPONIVEL', especie: 'GATO' },
    palavrasChave: ['gato', 'felino', 'adoção', 'divulgação', 'feira'],
    tipo: 'atalho',
  },
  {
    modulo: 'animais',
    icone: 'favorite',
    titulo: 'Animais adotados',
    descricao: 'Histórico de adoções',
    rota: '/animais',
    queryParams: { status: 'ADOTADO' },
    palavrasChave: ['adotado', 'adoção', 'histórico', 'acompanhamento'],
    tipo: 'atalho',
  },
  {
    modulo: 'animais',
    icone: 'pets',
    titulo: 'Cachorros',
    descricao: 'Todos os cães da ONG',
    rota: '/animais',
    queryParams: { especie: 'CACHORRO' },
    palavrasChave: ['cão', 'cães', 'cachorro', 'dog'],
    tipo: 'atalho',
  },
  {
    modulo: 'animais',
    icone: 'pets',
    titulo: 'Gatos',
    descricao: 'Todos os gatos da ONG',
    rota: '/animais',
    queryParams: { especie: 'GATO' },
    palavrasChave: ['gato', 'felino', 'cat'],
    tipo: 'atalho',
  },
  {
    modulo: 'animais',
    icone: 'sentiment_sad',
    titulo: 'Óbitos',
    descricao: 'Animais que faleceram',
    rota: '/animais',
    queryParams: { status: 'OBITO' },
    palavrasChave: ['óbito', 'falecido', 'morte'],
    tipo: 'atalho',
  },
  {
    modulo: 'responsaveis',
    icone: 'cottage',
    titulo: 'Lares temporários',
    descricao: 'Responsáveis do tipo lar temporário',
    rota: '/responsaveis',
    queryParams: { tipo: 'LAR_TEMPORARIO' },
    palavrasChave: ['lar temporário', 'LT', 'acolhimento'],
    tipo: 'atalho',
  },
  {
    modulo: 'responsaveis',
    icone: 'house',
    titulo: 'Abrigos',
    descricao: 'Responsáveis do tipo abrigo',
    rota: '/responsaveis',
    queryParams: { tipo: 'ABRIGO' },
    palavrasChave: ['abrigo', 'canil', 'gatil'],
    tipo: 'atalho',
  },
  {
    modulo: 'responsaveis',
    icone: 'shield_person',
    titulo: 'Protetores independentes',
    descricao: 'Responsáveis do tipo protetor',
    rota: '/responsaveis',
    queryParams: { tipo: 'PROTETOR_INDEPENDENTE' },
    palavrasChave: ['protetor', 'protetora', 'independente'],
    tipo: 'atalho',
  },
  {
    modulo: 'voluntarios',
    icone: 'event_repeat',
    titulo: 'Voluntários frequentes',
    descricao: 'Frequência diária ou semanal',
    rota: '/voluntarios',
    queryParams: { frequencia: 'DIARIA,SEMANAL' },
    palavrasChave: ['frequência', 'diário', 'semanal', 'escala'],
    tipo: 'atalho',
  },
  {
    modulo: 'voluntarios',
    icone: 'event',
    titulo: 'Voluntários eventuais',
    descricao: 'Para chamar em mutirões e feiras',
    rota: '/voluntarios',
    queryParams: { frequencia: 'EVENTUAL,MENSAL' },
    palavrasChave: ['eventual', 'mensal', 'mutirão', 'feira', 'evento', 'reforço'],
    tipo: 'atalho',
  },
  {
    modulo: 'responsaveis',
    icone: 'handshake',
    titulo: 'ONGs parceiras',
    descricao: 'Responsáveis do tipo ONG',
    rota: '/responsaveis',
    queryParams: { tipo: 'ONG' },
    palavrasChave: ['ONG', 'parceira', 'parceria', 'instituição'],
    tipo: 'atalho',
  },
  {
    modulo: 'racas',
    icone: 'category',
    titulo: 'Raças de cachorro',
    descricao: 'Raças cadastradas para cães',
    rota: '/racas',
    queryParams: { especie: 'CACHORRO' },
    palavrasChave: ['raça', 'cão', 'cachorro'],
    tipo: 'atalho',
  },
  {
    modulo: 'racas',
    icone: 'category',
    titulo: 'Raças de gato',
    descricao: 'Raças cadastradas para gatos',
    rota: '/racas',
    queryParams: { especie: 'GATO' },
    palavrasChave: ['raça', 'gato', 'felino'],
    tipo: 'atalho',
  },

  // --- Listas ---
  {
    modulo: 'animais',
    icone: 'list',
    titulo: 'Ver todos os animais',
    descricao: 'Lista completa de resgatados',
    rota: '/animais',
    palavrasChave: ['animais', 'listar', 'buscar animal', 'resgatados'],
    tipo: 'atalho',
  },
  {
    modulo: 'adotantes',
    icone: 'group',
    titulo: 'Ver adotantes',
    descricao: 'Lista de adotantes cadastrados',
    rota: '/adotantes',
    palavrasChave: ['adotantes', 'listar', 'buscar adotante', 'tutores'],
    tipo: 'atalho',
  },
  {
    modulo: 'voluntarios',
    icone: 'volunteer_activism',
    titulo: 'Ver voluntários',
    descricao: 'Lista da equipe de voluntários',
    rota: '/voluntarios',
    palavrasChave: ['voluntários', 'listar', 'equipe'],
    tipo: 'atalho',
  },
  {
    modulo: 'responsaveis',
    icone: 'badge',
    titulo: 'Ver responsáveis',
    descricao: 'Abrigos, lares temporários e protetores',
    rota: '/responsaveis',
    palavrasChave: ['responsáveis', 'listar'],
    tipo: 'atalho',
  },
  {
    modulo: 'racas',
    icone: 'category',
    titulo: 'Ver raças',
    descricao: 'Raças de cachorros e gatos',
    rota: '/racas',
    palavrasChave: ['raças', 'listar', 'espécies'],
    tipo: 'atalho',
  },

  // --- Cadastros menos frequentes ---
  {
    modulo: 'racas',
    icone: 'category',
    titulo: 'Nova raça',
    descricao: 'Adicionar raça de cachorro ou gato',
    rota: '/racas/novo',
    palavrasChave: ['cadastrar raça', 'espécie', 'SRD', 'vira-lata'],
    tipo: 'cadastro',
  },
];

/** Minúsculas e sem acentos, para a busca casar "voluntario" com "Voluntário". */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/**
 * Funcionalidades que casam com todas as palavras digitadas. Os itens das ações
 * rápidas (`destaque`) já estão visíveis na tela, então vão para o fim da lista.
 */
export function buscarFuncionalidades(termo: string): Funcionalidade[] {
  const palavras = normalizar(termo).split(/\s+/).filter(Boolean);
  const encontradas = FUNCIONALIDADES.filter((f) => {
    // Casa pelo início das palavras ("castr" → "castrados"), evitando falsos
    // positivos no meio delas ("raca" dentro de "castração").
    const alvo = normalizar([f.titulo, f.descricao, ...f.palavrasChave].join(' ')).split(/[^a-z0-9]+/);
    return palavras.every((p) => alvo.some((w) => w.startsWith(p)));
  });
  return [
    ...encontradas.filter((f) => !f.destaque),
    ...encontradas.filter((f) => f.destaque),
  ];
}
