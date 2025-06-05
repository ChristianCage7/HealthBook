import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ManageAvailabilityPageRoutingModule } from './manage-availability-routing.module';

import { ManageAvailabilityPage } from './manage-availability.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManageAvailabilityPageRoutingModule,
    SharedModule
  ],
  declarations: [ManageAvailabilityPage]
})
export class ManageAvailabilityPageModule {}
