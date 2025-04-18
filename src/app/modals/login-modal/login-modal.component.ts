import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import { sharedStandaloneImports } from 'src/app/shared_standalone';
import { Router } from '@angular/router';

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
    private fb: FormBuilder,
    private router: Router
  ) {}

  
  dismiss(){
    this.modalCtrl.dismiss();
  }

  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.value;

    const TEST_USER = {
      email: 'test@test.com',
      password: '12345678',
    }; //Usuario de testeo para verificar que funciona el login y redirige hacia las páginas principales

    if (email === TEST_USER.email && password === TEST_USER.password) {
      console.log('Inicio de sesión exitoso');
      localStorage.setItem('isLoggedIn', 'true');
      this.modalCtrl.dismiss();
      this.router.navigateByUrl('/tabs/main');
    } else {
      console.log('Credenciales inválidas');
      alert('Correo o contraseña incorrectos');
    }
  }

  viewMain(){ //Lleva al main
    this.router.navigateByUrl('/tabs/main');
  }

}
