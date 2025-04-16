import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { sharedStandaloneImports } from 'src/app/shared_standalone';

@Component({
  selector: 'app-register-modal',
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.scss'],
  imports: [IonicModule, sharedStandaloneImports],
  standalone: true,
})
export class RegisterModalComponent  {
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['',[Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  })

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder
  ) {}

  dismiss(){
    this.modalCtrl.dismiss();
  }

  register(){
    if(this.form.invalid || this.form.value.password !== this.form.value.confirmPassword){
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.form.value;
    console.log('Register data: ', name, email, password);
    this.modalCtrl.dismiss();
  }
}
