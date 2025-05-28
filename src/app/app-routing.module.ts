import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

const routes: Routes = [
  {
    path: 'main',
    loadChildren: () => import('./pages/main/main.module').then(m => m.MainPageModule)
  },
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthPageModule)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/menu/profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: 'menu',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/menu/menu.module').then(m => m.MenuPageModule)
  },
  {
    path: 'success-confirmation',
    loadChildren: () => import('./pages/auth/success-confirmation/success-confirmation.module').then(m => m.SuccessConfirmationPageModule)
  },
  {
    path: 'creditor',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/menu/creditor/creditor.module').then(m => m.CreditorPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
