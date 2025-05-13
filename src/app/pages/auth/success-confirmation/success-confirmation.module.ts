import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SuccessConfirmationPageRoutingModule } from './success-confirmation-routing.module';

import { SuccessConfirmationPage } from './success-confirmation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SuccessConfirmationPageRoutingModule
  ],
  declarations: [SuccessConfirmationPage]
})
export class SuccessConfirmationPageModule {}
