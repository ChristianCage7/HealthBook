import { Component, OnInit } from '@angular/core';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';
import { supabase } from './shared/services/supabase.client';
import { UserService } from './shared/services/user.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private userService: UserService
  ) {
    this.setupDeepLinking();
  }

  ngOnInit() {
  console.log('AppComponent ngOnInit');
  this.handleAppStart();
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
        console.log('Navegando a /creditor');
        this.router.navigateByUrl('/menu/creditor', { replaceUrl: true });
      } else {
        console.log('Navegando a /menu');
        this.router.navigateByUrl('/menu', { replaceUrl: true });
      }
    } else {
      console.log('No session, navegando a /auth');
      this.router.navigateByUrl('/main', { replaceUrl: true });
    }
  } catch (error) {
    console.error('Error en handleAppStart:', error);
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
        }
      }
    });
  }
}
