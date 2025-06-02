import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreditorPage } from './creditor.page';

const routes: Routes = [
  {
    path: '',
    component: CreditorPage
  },
  {
    path: 'creditor-profile-edit',
    loadChildren: () => import('./creditor-profile-edit/creditor-profile-edit.module').then( m => m.CreditorProfileEditPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreditorPageRoutingModule {}
