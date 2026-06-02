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
  { path: '**', redirectTo: 'animais' },
];
