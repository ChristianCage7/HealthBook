import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';
import { supabase } from './shared/services/supabase.client';
import { UserService } from './shared/services/user.service';
import { firstValueFrom } from 'rxjs';
import { ToastService } from './shared/services/toast.service';
import { CustomToastComponent } from './shared/components/custom-toast/custom-toast.component'; // Asegúrate que la ruta sea correcta
import { PushService } from './shared/services/push.service';

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
    private pushService: PushService
  ) {
    this.setupDeepLinking();
  }

  ngOnInit() {
    console.log('AppComponent ngOnInit');
    this.handleAppStart();
    this.pushService.initPush();
    this.pushService.fcmToken$.subscribe(token => {
      if (token) {
        console.log('📲 Token FCM listo');
      }
    });
  }

  ngAfterViewInit() {
    this.toastService.register(this.toastComponent);
  }

  async handleAppStart() {
    console.log('handleAppStart iniciado');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session:', session);
      if (session) {
        const isCreditor = await firstValueFrom(this.userService.isCreditor());
        console.log('Is creditor:', isCreditor);
        if (isCreditor) {
          this.router.navigateByUrl('/menu/creditor', { replaceUrl: true });
        } else {
          this.router.navigateByUrl('/menu', { replaceUrl: true });
        }
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
    App.addListener('appUrlOpen', (event) => {
      const url = event.url;
      if (url && url.startsWith('healthbook://')) {
        const path = url.replace('healthbook://', '');
        const basePath = path.split('#')[0];
        if (basePath === 'auth/reset-password') {
          this.router.navigateByUrl('/auth/reset-password');
        } else {
          console.warn('[Deep Link] Ruta desconocida:', basePath);
          this.toastService.show('Ruta desconocida en deep link', 'Aviso', 'warning');
        }
      }
    });
  }
}
