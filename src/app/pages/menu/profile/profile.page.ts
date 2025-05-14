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

  changePassword(){
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
