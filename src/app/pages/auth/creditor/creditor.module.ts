import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreditorPageRoutingModule } from './creditor-routing.module';

import { CreditorPage } from './creditor.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CreditorPageRoutingModule,
    SharedModule
  ],
  declarations: [CreditorPage]
})
export class CreditorPageModule {}
