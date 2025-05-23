import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignUpProfessionalPageRoutingModule } from './sign-up-professional-routing.module';

import { SignUpProfessionalPage } from './sign-up-professional.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignUpProfessionalPageRoutingModule,
    SharedModule,
    HttpClientModule
  ],
  declarations: [SignUpProfessionalPage]
})
export class SignUpProfessionalPageModule {}
