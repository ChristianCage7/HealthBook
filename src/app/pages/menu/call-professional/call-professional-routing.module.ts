import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CallProfessionalPage } from './call-professional.page';

const routes: Routes = [
  {
    path: '',
    component: CallProfessionalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CallProfessionalPageRoutingModule {}
