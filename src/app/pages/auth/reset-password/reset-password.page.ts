import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/shared/services/supabase.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: false
})
export class ResetPasswordPage implements OnInit {
  form!: FormGroup;
  tokenError = false;
  success = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private supabaseService: SupabaseService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.form = new FormGroup({
      newPassword: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    }, { validators: this.passwordMatchValidator });

    // Muy importante: iniciar sesión con el token de la URL
    const { error } = await this.supabaseService.setSessionFromUrlToken();
    if (error) {
      console.error('Error al establecer sesión desde URL:', error);
      this.tokenError = true; // activa mensaje visual
    }
  }

  get newPassword(): FormControl {
    return this.form.get('newPassword') as FormControl;
  }

  get confirmPassword(): FormControl {
    return this.form.get('confirmPassword') as FormControl;
  }

  async submit() {
    if (this.form.invalid) return;
  
    const { newPassword } = this.form.value;
    const { data, error } = await this.supabaseService.updatePassword(newPassword);
  
    if (error) {
      console.error('Error al actualizar la contraseña:', error.message);
      this.errorMessage = 'No se pudo actualizar la contraseña. Intenta nuevamente.';
    } else {
      console.log('Contraseña actualizada con éxito');
      this.success = true;
      this.errorMessage = null;
  
      // Redirige al login luego de 3 segundos
      setTimeout(() => {
        this.router.navigateByUrl('/auth');
      }, 3000);
    }
  }
  

  passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordsMismatch: true };
  }
}
