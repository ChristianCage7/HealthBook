import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { App as CapacitorApp } from '@capacitor/app';
import { Router } from '@angular/router';
import { supabase } from './shared/services/supabase.client';
import { UserService } from './shared/services/user.service';
import { firstValueFrom } from 'rxjs';
import { ToastService } from './shared/services/toast.service';
import { CustomToastComponent } from './shared/components/custom-toast/custom-toast.component';
import { PushService } from './shared/services/push.service';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform, ModalController, AlertController } from '@ionic/angular';
import { Location } from '@angular/common';
import { Camera } from '@capacitor/camera';

declare var NavigationBar: any;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild(CustomToastComponent) toastComponent!: CustomToastComponent;

  constructor(
    private router: Router,
    private userService: UserService,
    private toastService: ToastService,
    private pushService: PushService,
    private platform: Platform,
    private location: Location,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {
    this.setupDeepLinking();
    this.setupBackButtonHandler();
  }

  async ngOnInit() {
    await this.requestPermissions();
    this.handleAppStart();
    this.initSystemBars();
    this.pushService.initPush();
    this.pushService.fcmToken$.subscribe(token => {
      if (token) {
        console.log('Token FCM listo');
      }
    });
  }

  ngAfterViewInit() {
    this.toastService.register(this.toastComponent);
  }

  async requestPermissions() {
    try {
      // ✅ Solicita permiso de cámara (con Capacitor)
      await Camera.requestPermissions({ permissions: ['camera'] });

      // ✅ Solicita acceso al micrófono con Web API
      await navigator.mediaDevices.getUserMedia({ audio: true });

      console.log('✅ Permisos de cámara y micrófono concedidos');
    } catch (err) {
      console.warn('❌ Error solicitando permisos:', err);
    }
  }


  async handleAppStart() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const isCreditor = await firstValueFrom(this.userService.isCreditor());
        this.router.navigateByUrl(isCreditor ? '/menu/creditor' : '/menu', { replaceUrl: true });
      } else {
        this.router.navigateByUrl('/main', { replaceUrl: true });
      }
    } catch (error) {
      console.error('Error en handleAppStart:', error);
      this.toastService.show('Error al iniciar la app', 'Error', 'error');
      this.router.navigateByUrl('/main', { replaceUrl: true });
    }
  }

  setupDeepLinking() {
    CapacitorApp.addListener('appUrlOpen', (event) => {
      const url = event.url;
      if (url?.startsWith('healthbook://')) {
        const basePath = url.replace('healthbook://', '').split('#')[0];
        if (basePath === 'auth/reset-password') {
          this.router.navigateByUrl('/auth/reset-password');
        } else {
          this.toastService.show('Ruta desconocida en deep link', 'Aviso', 'warning');
        }
      }
    });
  }

  async initSystemBars() {
    try {
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setBackgroundColor({ color: '#000000' });
      await StatusBar.setStyle({ style: Style.Dark });
      if (typeof NavigationBar !== 'undefined') {
        NavigationBar.backgroundColorByHexString('#000000');
      }
    } catch (err) {
      console.warn('No se pudo establecer el color de las barras:', err);
    }
  }

  setupBackButtonHandler() {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      const currentUrl = this.router.url;

      const topModal = await this.modalCtrl.getTop();
      if (topModal) {
        await topModal.dismiss();
        return;
      }

      if (
        currentUrl === '/main' ||
        currentUrl === '/menu/home' ||
        currentUrl === '/menu/creditor' ||
        currentUrl === '/menu/professional-dashboard'
      ) {
        const alert = await this.alertCtrl.create({
          header: 'Salir de la app',
          message: '¿Estás seguro de que quieres salir?',
          buttons: [
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Salir',
              handler: () => CapacitorApp.exitApp()
            }
          ]
        });
        await alert.present();
        return;
      }

      const header = document.querySelector('app-header');
      const defaultHref = header?.getAttribute('ng-reflect-default-href');
      if (defaultHref) {
        this.router.navigateByUrl(defaultHref);
        return;
      }

      this.location.back();
    });
  }
}
