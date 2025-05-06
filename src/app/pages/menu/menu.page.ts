import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SupabaseService } from 'src/app/shared/services/supabase.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: false
})
export class MenuPage {
  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private alertCtrl: AlertController
  ) {}

  async logoutConfirm() {
    const alert = await this.alertCtrl.create({
      header: '¿Cerrar sesión?',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('🚫 Cancelación de cierre de sesión');
          },
        },
        {
          text: 'Cerrar sesión',
          role: 'confirm',
          handler: async () => {
            await this.supabaseService.signOut();
            console.log('✅ Cierre de sesión exitoso.');
            localStorage.clear();
            sessionStorage.clear();
            this.router.navigateByUrl('/auth', { replaceUrl: true });
          },
        },
      ],
    });

    await alert.present();
  }
}
