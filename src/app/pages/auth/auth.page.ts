import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/shared/services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: false,
})
export class AuthPage implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  loading = false;
  errorMessage: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('[Login] Componente inicializado');
  }

  async submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = null;

    const { email, password } = this.form.value!;
    console.log('[Login] Enviando credenciales:', email, password);

    const { data, error } = await this.supabaseService.signIn(email!, password!);

    this.loading = false;

    if (error) {
      console.error('[Login] Error al iniciar sesión:', error.message);
      this.errorMessage = error.message;

      if (error.message.includes('Email not confirmed')) {
        this.errorMessage = 'Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada.';
      } else if (error.message.includes('Invalid login credentials')) {
        this.errorMessage = 'Correo o contraseña incorrectos.';
      }

      return;
    }

    console.log('[Login] Usuario autenticado con éxito:', data);
    this.router.navigateByUrl('/menu');
  }
}
