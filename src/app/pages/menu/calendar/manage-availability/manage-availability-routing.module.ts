import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageAvailabilityPage } from './manage-availability.page';

const routes: Routes = [
  {
    path: '',
    component: ManageAvailabilityPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManageAvailabilityPageRoutingModule {}
