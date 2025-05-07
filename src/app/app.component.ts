import { Component } from '@angular/core';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private router: Router) {
    App.addListener('appUrlOpen', (event) => {
      const url = event.url;
      if (url && url.startsWith('healthbook://')) {
        const path = url.replace('healthbook://', '');
        const basePath = path.split('#')[0]; // elimina fragmento

        if (basePath === 'auth/reset-password') {
          this.router.navigateByUrl('/auth/reset-password');
        } else {
          console.warn('[Deep Link] Ruta desconocida:', basePath);
        }
      }
    });
    
  }
}