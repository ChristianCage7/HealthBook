import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/shared/services/supabase.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';
import { supabase } from 'src/app/shared/services/supabase.client';
import { ToastService } from 'src/app/shared/services/toast.service';

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
    private router: Router,
    private userService: UserService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    console.log('[Login] Componente inicializado');
  }

  async submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = null;

    const { email, password } = this.form.value!;

    try {
      const { data, error } = await this.supabaseService.signIn(email!, password!);
      this.loading = false;

      if (error) {
        const customMessage = error.message.includes('Invalid login credentials')
          ? 'Correo o contraseña incorrectos'
          : error.message || 'Error al iniciar sesión';

        this.toastService.show(customMessage, 'Error', 'error');
        return;
      }

      try {
        // Validar el estado del usuario (en tu backend personalizado)
        await this.userService.validateUserStatus();
      } catch (e: any) {
        // Si el servicio personalizado lanza un error (como "usuario no encontrado")
        this.toastService.show(e.message || 'No se pudo validar el usuario', 'Error', 'error');
        await supabase.auth.signOut(); // salir del auth
        return;
      }

      this.toastService.show('Inicio de sesión exitoso', 'Éxito', 'success');

      const isCreditor = await this.userService.isCreditor().toPromise();

      if (isCreditor) {
        console.log('Usuario es creditor, redirigiendo a /menu/creditor');
        this.router.navigateByUrl('/menu/creditor', { replaceUrl: true });
      } else {
        console.log('Usuario no es creditor, redirigiendo a /menu');
        this.router.navigateByUrl('/menu', { replaceUrl: true });
      }

    } catch (e: any) {
      this.loading = false;
      console.error('Error en login o validación:', e);

      // Asegurarse de cerrar sesión en Supabase
      await supabase.auth.signOut();

      const msg =
        e?.message?.includes('desactivada') || e?.message?.includes('inactive')
          ? 'Tu cuenta ha sido desactivada y no puedes iniciar sesión.'
          : 'Error inesperado al iniciar sesión';

      this.toastService.show(msg, 'Error', 'error');
    }
  }

}