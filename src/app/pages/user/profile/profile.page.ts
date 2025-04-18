import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { sharedStandaloneImports } from 'src/app/shared_standalone';
import { AlertController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [...sharedStandaloneImports, CommonModule, FormsModule]
})
export class ProfilePage implements OnInit {

  constructor(
    private alertController: AlertController,
    private navCtrl: NavController,
    private router: Router
  ) {
  }

  ngOnInit() {
  }

  
  async logoutConfirm() {
    const alert = await this.alertController.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Cerrar sesión',
          handler: () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            console.log("Se cierra la sesión de manera exitosa")
            this.router.navigateByUrl('/home');
          }
        }
      ]
    });

    await alert.present();
  }
}
