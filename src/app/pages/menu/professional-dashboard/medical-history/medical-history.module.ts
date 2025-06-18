import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MedicalHistoryPageRoutingModule } from './medical-history-routing.module';

import { MedicalHistoryPage } from './medical-history.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { AppointmentHistoryComponent } from './appointment-history/appointment-history.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MedicalHistoryPageRoutingModule,
    SharedModule
  ],
  declarations: [MedicalHistoryPage, AppointmentHistoryComponent]
})
export class MedicalHistoryPageModule {}
