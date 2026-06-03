import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'animais' },
  {
    path: 'animais',
    loadComponent: () =>
      import('./features/animais/animal-list/animal-list').then(
        (m) => m.AnimalList,
      ),
  },
  {
    path: 'animais/novo',
    loadComponent: () =>
      import('./features/animais/animal-form/animal-form').then(
        (m) => m.AnimalForm,
      ),
  },
  {
    path: 'animais/:id/editar',
    loadComponent: () =>
      import('./features/animais/animal-form/animal-form').then(
        (m) => m.AnimalForm,
      ),
  },
  {
    path: 'adotantes',
    loadComponent: () =>
      import('./features/adotantes/adotante-list/adotante-list').then(
        (m) => m.AdotanteList,
      ),
  },
  {
    path: 'adotantes/novo',
    loadComponent: () =>
      import('./features/adotantes/adotante-form/adotante-form').then(
        (m) => m.AdotanteForm,
      ),
  },
  {
    path: 'adotantes/:id/editar',
    loadComponent: () =>
      import('./features/adotantes/adotante-form/adotante-form').then(
        (m) => m.AdotanteForm,
      ),
  },
  {
    path: 'racas',
    loadComponent: () =>
      import('./features/racas/raca-list/raca-list').then(
        (m) => m.RacaList,
      ),
  },
  { path: '**', redirectTo: 'animais' },
];
