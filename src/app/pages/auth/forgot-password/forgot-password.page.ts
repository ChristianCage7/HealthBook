import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/shared/services/supabase.service';
import { ToastController } from '@ionic/angular';

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
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  async submit() {
    if (this.form.invalid) return;

    const email = this.form.value.email!;
    
    try {
      const { data, error } = await this.supabaseService.resetPassword(email);
      
      if (error) {
        this.showToast('Error al enviar enlace. Intenta de nuevo.', 'danger');
        console.error(error);
      } else {
        this.showToast('Enlace enviado correctamente. Revisa tu correo.', 'success');
      }
    } catch (err) {
      console.error(err);
      this.showToast('Algo salió mal. Intenta más tarde.', 'danger');
    }
  }

  async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color
    });
    toast.present();
  }
}
