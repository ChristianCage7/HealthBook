import { Routes } from '@angular/router';
import { tabsRoutes } from './pages/tabs/tabs.routes';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    children: tabsRoutes
  },

];
