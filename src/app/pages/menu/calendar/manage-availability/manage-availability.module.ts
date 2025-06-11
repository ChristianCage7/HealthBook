import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ManageAvailabilityPage } from './manage-availability.page';
import { RouterModule } from '@angular/router';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [ManageAvailabilityPage],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: ManageAvailabilityPage }]),
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    SharedModule
  ],
})
export class ManageAvailabilityPageModule {}
