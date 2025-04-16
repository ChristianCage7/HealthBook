import { Component } from '@angular/core';
import {IonicModule, ModalController} from '@ionic/angular'
import { RegisterModalComponent } from '../modals/register-modal/register-modal.component';
import { LoginModalComponent } from '../modals/login-modal/login-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonicModule],})
export class HomePage {
  constructor(private modalCtrl: ModalController) {}

  async openLoginModal(){
    const modal = await this.modalCtrl.create({
      component: LoginModalComponent
    });
    await modal.present();
  }

  async openRegisterModal(){
    const modal = await this.modalCtrl.create({
      component: RegisterModalComponent
    });
    await modal.present();
  }
}
