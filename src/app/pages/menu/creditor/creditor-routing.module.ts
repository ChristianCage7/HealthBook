import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreditorPage } from './creditor.page';

const routes: Routes = [
  {
    path: '',
    component: CreditorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreditorPageRoutingModule {}
