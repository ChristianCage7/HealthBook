import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SuccessConfirmationPage } from './success-confirmation.page';

const routes: Routes = [
  {
    path: '',
    component: SuccessConfirmationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuccessConfirmationPageRoutingModule {}
