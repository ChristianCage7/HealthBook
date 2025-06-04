import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/shared/services/supabase.service';
import { ToastController } from '@ionic/angular';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: false
})
export class ForgotPasswordPage implements OnInit {

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  constructor(
    private supabaseService: SupabaseService,
    private toastService: ToastService,

  ) { }

  ngOnInit() { }

  async submit() {
    if (this.form.invalid) return;

    const email = this.form.value.email!;

    try {
      const { data, error } = await this.supabaseService.resetPassword(email);

      if (error) {
        this.toastService.show('Error al enviar enlace. Intenta de nuevo.', 'Error', 'error');
        console.error(error);
      } else {
        this.toastService.show('Enlace enviado correctamente. Revisa tu correo.', 'Éxito','success');
      }
    } catch (err) {
      console.error(err);
      this.toastService.show('Algo salió mal. Intenta más tarde.','Error','error')
    }
  }

}
