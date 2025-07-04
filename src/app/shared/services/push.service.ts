import { Injectable } from '@angular/core';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { supabase } from './supabase.client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  private fcmTokenSubject = new BehaviorSubject<string | null>(null);
  fcmToken$ = this.fcmTokenSubject.asObservable(); // puedes suscribirte si lo necesitas en otros componentes

  private initialized = false;
  private apiUrl = environment.backendUrl
  
  constructor(
    private platform: Platform,
    ) { }

  async initPush() {
    if (this.initialized) return;
    this.initialized = true;

    if (!this.platform.is('capacitor') || !this.platform.is('android')) {
      console.warn('⚠️ Push Notifications solo disponibles en dispositivo Android real.');
      return;
    }

    console.log('📱 Inicializando Push Notifications...');

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') {
      console.error('❌ Permiso denegado para notificaciones push');
      return;
    }

    console.log('✅ Permiso concedido. Registrando dispositivo...');
    await PushNotifications.register();

    PushNotifications.addListener('registration', (token: Token) => {
      console.log('📨 Token FCM recibido:', token.value);
      this.fcmTokenSubject.next(token.value);
      this.sendTokenToBackend(token.value); // 👈 Envío inmediato al backend
    });

    PushNotifications.addListener('registrationError', err => {
      console.error('❌ Error en el registro FCM:', err);
    });

    PushNotifications.addListener('pushNotificationReceived', async (notification: PushNotificationSchema) => {
      console.log('🔔 Push recibida en foreground:', notification);

      // Mostrarla como local
      await LocalNotifications.schedule({
        notifications: [
          {
            title: notification.title || 'Notificación',
            body: notification.body || '',
            id: Date.now(), // ID único
            schedule: { at: new Date(Date.now()) },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: notification.data
          }
        ]
      });
    });


    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('📲 Usuario tocó la notificación:', action.notification);
    });
  }

  getToken(): string | null {
    return this.fcmTokenSubject.value;
  }

  private async sendTokenToBackend(token: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;

      if (!uid) {
        console.warn('⚠️ UID no disponible, no se puede enviar el token');
        return;
      }

      await fetch(`${this.apiUrl}/api/push-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token })
      });

      console.log('✅ Token push enviado correctamente al backend');
    } catch (err) {
      console.error('❌ Error al enviar token push al backend:', err);
    }
  }

}
