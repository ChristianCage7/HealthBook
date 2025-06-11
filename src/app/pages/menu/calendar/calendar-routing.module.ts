import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CalendarPage } from './calendar.page';

const routes: Routes = [
  {
    path: '',
    component: CalendarPage
  },
    {
    path: 'manage-availability',
    loadChildren: () =>
      import('./manage-availability/manage-availability.module')
        .then((m) => m.ManageAvailabilityPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalendarPageRoutingModule {}
