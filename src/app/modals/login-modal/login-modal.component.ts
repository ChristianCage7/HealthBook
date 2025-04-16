import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { sharedStandaloneImports } from 'src/app/shared_standalone';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
  imports: [IonicModule, sharedStandaloneImports],
  standalone: true,
})
export class LoginModalComponent{

  form = this.fb.group({
    email: ['',[Validators.required, Validators.email]],
    password: ['',[Validators.required,Validators.minLength(8)]],
  })

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder
  ) {}

  dismiss(){
    this.modalCtrl.dismiss();
  }

  login(){
    if(this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.value;
    console.log('Login data: ', email, password);
    this.modalCtrl.dismiss();
  }

}
