import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfessionalDashboardPage } from './professional-dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: ProfessionalDashboardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfessionalDashboardPageRoutingModule {}
