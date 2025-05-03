import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignUpProfessionalPageRoutingModule } from './sign-up-professional-routing.module';

import { SignUpProfessionalPage } from './sign-up-professional.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignUpProfessionalPageRoutingModule
  ],
  declarations: [SignUpProfessionalPage]
})
export class SignUpProfessionalPageModule {}
