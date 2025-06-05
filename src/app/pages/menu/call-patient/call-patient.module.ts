import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CallPatientPageRoutingModule } from './call-patient-routing.module';

import { CallPatientPage } from './call-patient.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CallPatientPageRoutingModule
  ],
  declarations: [CallPatientPage]
})
export class CallPatientPageModule {}
