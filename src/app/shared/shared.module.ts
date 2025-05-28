import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { CustomInputComponent } from './components/custom-input/custom-input.component';
import { LogoComponent } from './components/logo/logo.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomSelectComponent } from './components/custom-select/custom-select.component';
import { ReviewDocumentModalComponent } from './components/review-document-modal/review-document-modal.component';

@NgModule({
  declarations: [
    HeaderComponent,
    CustomInputComponent,
    LogoComponent,
    CustomSelectComponent,
    ReviewDocumentModalComponent,

  ],
  exports: [
    HeaderComponent,
    CustomInputComponent,
    LogoComponent,
    CustomSelectComponent,
    ReviewDocumentModalComponent,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }
