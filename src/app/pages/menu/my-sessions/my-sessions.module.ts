import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MySessionsPageRoutingModule } from './my-sessions-routing.module';

import { MySessionsPage } from './my-sessions.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MySessionsPageRoutingModule,
    SharedModule
  ],
  declarations: [MySessionsPage]
})
export class MySessionsPageModule {}
