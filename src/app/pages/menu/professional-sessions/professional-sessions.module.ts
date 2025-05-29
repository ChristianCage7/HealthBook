import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfessionalSessionsPageRoutingModule } from './professional-sessions-routing.module';

import { ProfessionalSessionsPage } from './professional-sessions.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfessionalSessionsPageRoutingModule
  ],
  declarations: [ProfessionalSessionsPage]
})
export class ProfessionalSessionsPageModule {}
