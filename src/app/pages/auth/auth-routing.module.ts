import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthPage } from './auth.page';

const routes: Routes = [
  {
    path: '',
    component: AuthPage
  },
  {
    path: 'sign-up',
    loadChildren: () => import('./sign-up/sign-up.module').then( m => m.SignUpPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },  {
    path: 'sign-up-professional',
    loadChildren: () => import('./sign-up-professional/sign-up-professional.module').then( m => m.SignUpProfessionalPageModule)
  },
  {
    path: 'creditor',
    loadChildren: () => import('./creditor/creditor.module').then( m => m.CreditorPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./reset-password/reset-password.module').then( m => m.ResetPasswordPageModule)
  },
  {
    path: 'success-confirmation',
    loadChildren: () => import('./success-confirmation/success-confirmation.module').then( m => m.SuccessConfirmationPageModule)
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthPageRoutingModule {}
