import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SupabaseService } from 'src/app/shared/services/supabase.service';
import { environment } from 'src/environments/environment';



@Component({
  selector: 'app-sign-up',
  standalone: false,
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],

})
export class SignUpPage implements OnInit {

  form!: FormGroup;

  constructor(
    private supabaseService: SupabaseService,
    private http: HttpClient,
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private router: Router
  ) {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      nationalId: new FormControl('', [Validators.required]),
      birthDate: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required])
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
  }

  async submit() {
    if (this.form.invalid) return;

    const formData = this.form.value;

    try {
      // Crear usuario en Supabase Auth
      const { data, error } = await this.supabaseService.signUp(formData.email, formData.password);


      if (error) throw error;
      if (!data.user) {
        throw new Error('No se pudo crear el usuario. Revisa si el correo ya está registrado.');
      }
      const uid = data.user.id;

      // Imagen de perfil por defecto
      const defaultImageBlob = await fetch('assets/icon/profile-img.png').then(res => res.blob());
      const defaultImageFile = new File([defaultImageBlob], 'profile-img.png', { type: 'image/png' });

      // Enviar datos al backend
      const formPayload = new FormData();
      formPayload.append('uid', uid);
      formPayload.append('email', formData.email);
      formPayload.append('firstName', formData.firstName);
      formPayload.append('lastName', formData.lastName);
      formPayload.append('dni', formData.nationalId);
      formPayload.append('idProfile', '1');
      formPayload.append('idGender', formData.gender);
      formPayload.append('datebirth', formData.birthDate);
      formPayload.append('imgprofile', defaultImageFile);

      await this.http.post(`${environment.apiUrl}/register`, formPayload, {
        responseType: 'text'
      }).toPromise();

      this.showAlert('Registro completado. Revisa tu correo para confirmar la cuenta.');
      this.form.reset();
      this.router.navigateByUrl('/auth');


    } catch (error) {
      console.error('Error al registrar usuario:', error);
      this.showAlert('Error al registrar usuario.');
    }
  }

  getFormControl(controlName: string): FormControl {
    return this.form.get(controlName) as FormControl;
  }

  passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  private async showAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Atención',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

}
