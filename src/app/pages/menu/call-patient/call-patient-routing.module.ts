import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CallPatientPage } from './call-patient.page';

const routes: Routes = [
  {
    path: '',
    component: CallPatientPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CallPatientPageRoutingModule {}
