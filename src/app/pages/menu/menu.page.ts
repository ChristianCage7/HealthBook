import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { supabase } from 'src/app/shared/services/supabase.client';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: false
})
export class MenuPage {

  currentUrl: string = '';
  isCreditor = false;
  isProfessional = false;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private userService: UserService
  ) {
    this.router.events.subscribe(() => {
      this.currentUrl = this.router.url;
    });
  }

 async ngOnInit() {
  try {
    this.isCreditor = await firstValueFrom(this.userService.isCreditor());
    this.isProfessional = await firstValueFrom(this.userService.isProfessional());

    console.log('isCreditor:', this.isCreditor);
    console.log('isProfessional:', this.isProfessional);

    if (this.isProfessional && this.router.url.includes('/menu/home')) {
      this.router.navigateByUrl('/menu/professional-dashboard', { replaceUrl: true });
    }
  } catch (err) {
    console.error('Error verificando tipo de usuario:', err);
  }
  }

  async logoutConfirm() {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar sesión',
          handler: async () => {
            await supabase.auth.signOut();
            this.router.navigateByUrl('/main', { replaceUrl: true });
          }
        }
      ]
    });
    await alert.present();
  }
};