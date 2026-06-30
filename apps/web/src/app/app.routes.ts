import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./health/health').then((m) => m.Health),
  },
  { path: '**', redirectTo: '' },
];
