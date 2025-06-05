import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CallProfessionalPageRoutingModule } from './call-professional-routing.module';

import { CallProfessionalPage } from './call-professional.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CallProfessionalPageRoutingModule
  ],
  declarations: [CallProfessionalPage]
})
export class CallProfessionalPageModule {}
