import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.HomeComponent),
  },
  {
    path: 'jobs',
    loadComponent: () => import('./features/jobs/jobs').then(m => m.JobsComponent),
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent),
        canActivate: [guestGuard],
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent),
        canActivate: [guestGuard],
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'favorites',
    loadComponent: () => import('./features/favorites/favorites').then(m => m.FavoritesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'applications',
    loadComponent: () => import('./features/application/application').then(m => m.ApplicationsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
