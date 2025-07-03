import { Injectable } from '@angular/core';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PushService {
  private fcmTokenSubject = new BehaviorSubject<string | null>(null);
  fcmToken$ = this.fcmTokenSubject.asObservable(); // puedes suscribirte si lo necesitas en otros componentes

  private initialized = false;

  constructor(private platform: Platform) { }

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
}
