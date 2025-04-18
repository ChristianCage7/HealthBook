import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const tabsRoutes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'main',
        loadComponent: () => import('../main/main.page').then(m => m.MainPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('../user/profile/profile.page').then(m => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full',
      }
    ]
  }
];
