import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfessionalDashboardPageRoutingModule } from './professional-dashboard-routing.module';

import { ProfessionalDashboardPage } from './professional-dashboard.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfessionalDashboardPageRoutingModule,
    SharedModule
  ],
  declarations: [ProfessionalDashboardPage]
})
export class ProfessionalDashboardPageModule {}
