import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignUpProfessionalPage } from './sign-up-professional.page';

const routes: Routes = [
  {
    path: '',
    component: SignUpProfessionalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignUpProfessionalPageRoutingModule {}
