import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit {

  user:any = {};
  notifications = true;
  editEmail = false;

  constructor(
    private userService: UserService,
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    this.loadProfile();
  }

  loadProfile(){
    this.userService.getCurrentUser().subscribe(res => {
      this.user = res[0];
    });
  }

  toggleEditEmail(){
    this.userService.getCurrentUser().subscribe(res => {
      this.user = res[0];
    });
  }

  submit(){
    this.userService.updateUser(this.user).subscribe(async () => {
      const alert = await this.alertCtrl.create({
        header: 'Éxito',
        message: 'Perfil actualizado correctamente',
        buttons: ['Ok']
      });
      await alert.present();
    });
  }

    async confirmChangePassword() {
    const alert = await this.alertCtrl.create({
      header: 'Cambiar contraseña',
      message: 'Se enviará un correo a tu dirección actual para cambiar la contraseña. ¿Deseas continuar?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Enviar correo',
          handler: () => {
            this.sendPasswordRecovery();
          }
        }
      ]
    });

    await alert.present();
  }

  sendPasswordRecovery() {
    this.userService.sendPasswordRecovery(this.user.email).subscribe(async () => {
      const alert = await this.alertCtrl.create({
        header: 'Correo enviado',
        message: 'Revisa tu correo para cambiar la contraseña.',
        buttons: ['OK']
      });
      await alert.present();
    });
  }

  deleteAccount(){}
}
