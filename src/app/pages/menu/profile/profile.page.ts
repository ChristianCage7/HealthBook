import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { SupabaseService } from 'src/app/shared/services/supabase.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit {
  form!: FormGroup;
  avatarUrl: string | null = null;
  patientName: string = '';
  uid: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private alertCtrl: AlertController,
    private router: Router,
    private supabaseService: SupabaseService
  ) { }

  async ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl(''),
      confirmPassword: new FormControl(''),
      dateBirth: new FormControl('', [Validators.required]),
      notifications: new FormControl(false)
    }, { validators: this.passwordMatchValidator });

    try {
      const { data, error } = await this.supabaseService.getUser();
      if (error || !data?.user) {
        console.error('❌ Error al obtener el usuario:', error?.message);
        return;
      }

      const uid = data.user.id;
      const email = data.user.email;
      console.log('🧑 UID actual:', uid);

      this.form.patchValue({ email }); // ✅ llenar campo de email

      this.http.get<any[]>(`${environment.apiUrl}/users/basic/${uid}`).subscribe({
        next: (response) => {
          console.log('🧾 Datos del perfil recibidos:', response);

          const user = response[0]; // ✅ porque la respuesta es un array

          this.avatarUrl = user.imgprofile || 'assets/img/avatar-default.png';
          this.patientName = `${user.first_name} ${user.last_name}`;
          console.log('✅ Avatar URL cargado:', this.avatarUrl);
        },
        error: (err) => {
          console.error('❌ Error al obtener perfil desde backend:', err);
        }
      });

    } catch (err) {
      console.error('❌ Error inesperado en ngOnInit:', err);
    }
  }

  getFormControl(controlName: string): FormControl {
    return this.form.get(controlName) as FormControl;
  }

  passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (!password && !confirmPassword) return null;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  async submit() {
    if (this.form.invalid) return;

    const email = this.form.get('email')?.value;
    const password = this.form.get('password')?.value;
    const confirmPassword = this.form.get('confirmPassword')?.value;

    if (password && password !== confirmPassword) {
      console.error('❌ Las contraseñas no coinciden');
      return;
    }

    try {
      const { data, error } = await this.supabaseService.getUser();
      if (error || !data?.user) {
        console.error('❌ Error al obtener el usuario:', error?.message);
        return;
      }

      const currentEmail = data.user.email;
      const emailChanged = email !== currentEmail;
      const passwordSet = !!password;

      if (emailChanged || passwordSet) {
        const { error: updateError } = await this.supabaseService.updateUserProfile(
          emailChanged ? email : currentEmail,
          passwordSet ? password : null
        );

        if (updateError) {
          console.error('❌ Error al actualizar perfil:', updateError.message);
        } else {
          console.log('✅ Perfil actualizado correctamente');
        }
      } else {
        console.log('⚠️ No hay cambios para guardar');
      }
    } catch (err) {
      console.error('❌ Error inesperado:', err);
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.avatarUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
