import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookAppointmentPage } from './book-appointment.page';

const routes: Routes = [
  {
    path: '',
    component: BookAppointmentPage
  },  {
    path: 'new-appointment',
    loadChildren: () => import('./new-appointment/new-appointment.module').then( m => m.NewAppointmentPageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookAppointmentPageRoutingModule {}
