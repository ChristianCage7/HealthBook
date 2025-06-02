import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreditorProfileEditPage } from './creditor-profile-edit.page';

const routes: Routes = [
  {
    path: '',
    component: CreditorProfileEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreditorProfileEditPageRoutingModule {}
