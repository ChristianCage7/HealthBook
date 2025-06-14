import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { NewAppointmentPageRoutingModule } from './new-appointment-routing.module';

import { NewAppointmentPage } from './new-appointment.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewAppointmentPageRoutingModule,
    SharedModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
  ],
  declarations: [NewAppointmentPage]
})
export class NewAppointmentPageModule { }
