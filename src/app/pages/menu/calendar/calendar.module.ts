import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CalendarPage } from './calendar.page';
import { AvailabilityModalComponent } from './availability-modal/availability-modal.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FormsModule } from '@angular/forms';
import { AppointmentModalComponent } from './appointment-modal/appointment-modal/appointment-modal.component';

@NgModule({
  declarations: [
    CalendarPage,
    AppointmentModalComponent,
    AvailabilityModalComponent 
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory })
  ]
})
export class CalendarPageModule {}
