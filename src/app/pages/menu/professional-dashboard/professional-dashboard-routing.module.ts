import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfessionalDashboardPage } from './professional-dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: ProfessionalDashboardPage
  },  {
    path: 'medical-history',
    loadChildren: () => import('./medical-history/medical-history.module').then( m => m.MedicalHistoryPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfessionalDashboardPageRoutingModule {}
