import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfessionalSessionsPage } from './professional-sessions.page';

const routes: Routes = [
  {
    path: '',
    component: ProfessionalSessionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfessionalSessionsPageRoutingModule {}
