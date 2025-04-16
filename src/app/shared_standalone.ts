// src/app/shared/shared-standalone.ts

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

export const sharedStandaloneImports = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  IonicModule // <-- esto importa todos los componentes de Ionic
];
