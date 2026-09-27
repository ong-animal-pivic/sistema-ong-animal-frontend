import { Routes } from '@angular/router';
import { DadosRotaModulo } from './shared/modulos';

// `data` identifica o módulo e a página de cada rota; o shell (`App`) usa isso
// para aplicar a cor/ícone do módulo e montar a trilha "Início › Módulo › Página".
const dados = (d: DadosRotaModulo): DadosRotaModulo => d;

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    data: dados({ modulo: 'inicio' }),
    loadComponent: () => import('./features/inicio/inicio').then((m) => m.Inicio),
  },
  {
    path: 'animais',
    data: dados({ modulo: 'animais' }),
    loadComponent: () =>
      import('./features/animais/animal-list/animal-list').then(
        (m) => m.AnimalList,
      ),
  },
  {
    path: 'animais/novo',
    data: dados({ modulo: 'animais', pagina: 'Novo' }),
    loadComponent: () =>
      import('./features/animais/animal-form/animal-form').then(
        (m) => m.AnimalForm,
      ),
  },
  {
    path: 'animais/:id/editar',
    data: dados({ modulo: 'animais', pagina: 'Editar' }),
    loadComponent: () =>
      import('./features/animais/animal-form/animal-form').then(
        (m) => m.AnimalForm,
      ),
  },
  {
    path: 'animais/:id',
    data: dados({ modulo: 'animais', pagina: 'Detalhe' }),
    loadComponent: () =>
      import('./features/animais/animal-detail/animal-detail').then(
        (m) => m.AnimalDetail,
      ),
  },
  {
    path: 'adotantes',
    data: dados({ modulo: 'adotantes' }),
    loadComponent: () =>
      import('./features/adotantes/adotante-list/adotante-list').then(
        (m) => m.AdotanteList,
      ),
  },
  {
    path: 'adotantes/novo',
    data: dados({ modulo: 'adotantes', pagina: 'Novo' }),
    loadComponent: () =>
      import('./features/adotantes/adotante-form/adotante-form').then(
        (m) => m.AdotanteForm,
      ),
  },
  {
    path: 'adotantes/:id/editar',
    data: dados({ modulo: 'adotantes', pagina: 'Editar' }),
    loadComponent: () =>
      import('./features/adotantes/adotante-form/adotante-form').then(
        (m) => m.AdotanteForm,
      ),
  },
  {
    path: 'adotantes/:id',
    data: dados({ modulo: 'adotantes', pagina: 'Detalhe' }),
    loadComponent: () =>
      import('./features/adotantes/adotante-detail/adotante-detail').then(
        (m) => m.AdotanteDetail,
      ),
  },
  {
    path: 'racas',
    data: dados({ modulo: 'racas' }),
    loadComponent: () =>
      import('./features/racas/raca-list/raca-list').then((m) => m.RacaList),
  },
  {
    path: 'racas/novo',
    data: dados({ modulo: 'racas', pagina: 'Novo' }),
    loadComponent: () =>
      import('./features/racas/raca-form/raca-form').then((m) => m.RacaForm),
  },
  {
    path: 'racas/:id/editar',
    data: dados({ modulo: 'racas', pagina: 'Editar' }),
    loadComponent: () =>
      import('./features/racas/raca-form/raca-form').then((m) => m.RacaForm),
  },
  {
    path: 'responsaveis',
    data: dados({ modulo: 'responsaveis' }),
    loadComponent: () =>
      import('./features/responsaveis/responsavel-list/responsavel-list').then(
        (m) => m.ResponsavelList,
      ),
  },
  {
    path: 'responsaveis/novo',
    data: dados({ modulo: 'responsaveis', pagina: 'Novo' }),
    loadComponent: () =>
      import('./features/responsaveis/responsavel-form/responsavel-form').then(
        (m) => m.ResponsavelForm,
      ),
  },
  {
    path: 'responsaveis/:id/editar',
    data: dados({ modulo: 'responsaveis', pagina: 'Editar' }),
    loadComponent: () =>
      import('./features/responsaveis/responsavel-form/responsavel-form').then(
        (m) => m.ResponsavelForm,
      ),
  },
  {
    path: 'responsaveis/:id',
    data: dados({ modulo: 'responsaveis', pagina: 'Detalhe' }),
    loadComponent: () =>
      import('./features/responsaveis/responsavel-detail/responsavel-detail').then(
        (m) => m.ResponsavelDetail,
      ),
  },
  {
    path: 'voluntarios',
    data: dados({ modulo: 'voluntarios' }),
    loadComponent: () =>
      import('./features/voluntarios/voluntario-list/voluntario-list').then(
        (m) => m.VoluntarioList,
      ),
  },
  {
    path: 'voluntarios/novo',
    data: dados({ modulo: 'voluntarios', pagina: 'Novo' }),
    loadComponent: () =>
      import('./features/voluntarios/voluntario-form/voluntario-form').then(
        (m) => m.VoluntarioForm,
      ),
  },
  {
    path: 'voluntarios/:id/editar',
    data: dados({ modulo: 'voluntarios', pagina: 'Editar' }),
    loadComponent: () =>
      import('./features/voluntarios/voluntario-form/voluntario-form').then(
        (m) => m.VoluntarioForm,
      ),
  },
  {
    path: 'voluntarios/:id',
    data: dados({ modulo: 'voluntarios', pagina: 'Detalhe' }),
    loadComponent: () =>
      import('./features/voluntarios/voluntario-detail/voluntario-detail').then(
        (m) => m.VoluntarioDetail,
      ),
  },
  {
    path: 'areas',
    data: dados({ modulo: 'areas' }),
    loadComponent: () =>
      import('./features/areas/area-list/area-list').then((m) => m.AreaList),
  },
  {
    path: 'areas/novo',
    data: dados({ modulo: 'areas', pagina: 'Novo' }),
    loadComponent: () =>
      import('./features/areas/area-form/area-form').then((m) => m.AreaForm),
  },
  {
    path: 'areas/:id/editar',
    data: dados({ modulo: 'areas', pagina: 'Editar' }),
    loadComponent: () =>
      import('./features/areas/area-form/area-form').then((m) => m.AreaForm),
  },
  {
    path: 'areas/:id',
    data: dados({ modulo: 'areas', pagina: 'Detalhe' }),
    loadComponent: () =>
      import('./features/areas/area-detail/area-detail').then((m) => m.AreaDetail),
  },
  { path: '**', redirectTo: '' },
];
