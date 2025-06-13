import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CallProfessionalPageRoutingModule } from './call-professional-routing.module';

import { CallProfessionalPage } from './call-professional.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CallProfessionalPageRoutingModule,
    SharedModule
  ],
  declarations: [CallProfessionalPage]
})
export class CallProfessionalPageModule {}
