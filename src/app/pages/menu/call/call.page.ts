import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  OpenVidu,
  Session,
  Publisher,
  StreamEvent,
  Subscriber,
} from 'openvidu-browser';
import { environment } from 'src/environments/environment';
import { AppointmentService } from 'src/app/shared/services/appointment.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ChatModalComponent } from 'src/app/shared/components/chat-modal/chat-modal.component';

@Component({
  selector: 'app-call',
  templateUrl: './call.page.html',
  styleUrls: ['./call.page.scss'],
  standalone: false
})
export class CallPage implements OnInit, OnDestroy {
  @ViewChild('publisherContainer') publisherContainer!: ElementRef;
  @ViewChild('subscriberContainer') subscriberContainer!: ElementRef;

  OV!: OpenVidu;
  session!: Session;
  publisher!: Publisher;
  subscribers: Subscriber[] = [];
  idappointment!: number;
  sessionId = 'HealthbookTestSession';
  token!: string;
  role: 'patient' | 'professional' = 'patient'; // Ajusta dinámicamente según el usuario
  muted = false;
  showMessage = false;
  messageText = '';
  videoOff = false;
  isSpeakerOn = false;

  constructor(private appointmentService: AppointmentService, private router: Router,   private modalCtrl: ModalController) { }

  async ngOnInit() {
    const nav = window.history.state;
    this.idappointment = nav?.idappointment;

    this.OV = new OpenVidu();
    this.session = this.OV.initSession();

      this.session.on('streamCreated', (event: StreamEvent) => {
        this.session.subscribe(
          event.stream,
          this.subscriberContainer.nativeElement
        );
      });

      console.log('📡 Solicitando token...');
      this.token = await this.getToken(this.sessionId);
      console.log('✅ Token recibido');

      await this.session.connect(this.token, { clientData: this.role });

      this.publisher = this.OV.initPublisher(this.publisherContainer.nativeElement, {
        insertMode: 'APPEND',
        publishAudio: true,
        publishVideo: true,
        audioSource: undefined,
        videoSource: undefined,
      });

      this.session.publish(this.publisher);
      console.log('✅ Stream publicado');
    } catch (error) {
      console.error('❌ Error en permisos o publicación:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.session) {
      this.session.disconnect();
    }
  }

  async getToken(sessionId: string): Promise<string> {
    const sessionResponse = await fetch(`${environment.openviduUrl}/openvidu/api/sessions`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + environment.openviduSecret),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customSessionId: sessionId }),
    });

    if (sessionResponse.status !== 200 && sessionResponse.status !== 409) {
      throw new Error(`Error al crear la sesión: ${sessionResponse.status}`);
    }

    const tokenResponse = await fetch(`${environment.openviduUrl}/openvidu/api/sessions/${sessionId}/connection`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + environment.openviduSecret),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const tokenData = await tokenResponse.json();
    return tokenData.token;
  }

 endCall() {
  this.session.disconnect();

  if (this.idappointment) {
    this.appointmentService.completeAppointment(this.idappointment)
      .subscribe({
        next: () => {
          this.showFeedback('Cita finalizada con éxito');
          setTimeout(() => {
            this.router.navigate(['/menu/home']);
          }, 1800); // Espera 1.8 seg para mostrar el mensaje antes de ir al home
        },
        error: err => {
          console.error('Error al completar la cita:', err);
          this.showFeedback('No se pudo finalizar la cita');
        }
      });
  } else {
    this.router.navigate(['/menu/home']); // fallback si no hay cita
  }
}


  toggleMute() {
    this.muted = !this.muted;
    if (this.publisher) {
      this.publisher.publishAudio(!this.muted);
      this.showFeedback(this.muted ? '¡Estás muteado!' : '¡Micrófono activado!');
    }
  }

  private showFeedback(message: string) {
    this.messageText = message;
    this.showMessage = true;

    setTimeout(() => {
      this.showMessage = false;
    }, 2000); // Ocultar después de 2 segundos
  }

  toggleCamera() {
    this.videoOff = !this.videoOff;
    if (this.publisher) {
      this.publisher.publishVideo(!this.videoOff);
      this.showFeedback(this.videoOff ? '¡Cámara apagada!' : '¡Cámara activada!');
    }
  }

  async toggleSpeaker() {
    this.isSpeakerOn = !this.isSpeakerOn;

    try {
      // @ts-ignore - usamos directamente Web API no oficial (en algunos Androids)
      const audioContext = new AudioContext();
      const audioDestination = this.isSpeakerOn
        ? audioContext.destination // altavoz
        : audioContext.createMediaStreamDestination(); // auricular

      this.showFeedback(this.isSpeakerOn ? 'Salida por altavoz' : 'Salida por auricular');
    } catch (e) {
      console.error('No se pudo cambiar la salida de audio:', e);
      this.showFeedback('No se pudo cambiar la salida de audio');
    }
  }

  private async getCurrentUid(): Promise<string> {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  const user = await supabase.auth.getUser();
  return user.data.user?.id || '';
}

  async openChat() {
  if (!this.idappointment) {
    this.showFeedback('No se puede abrir el chat sin cita activa');
    return;
  }

  const receiverUid = await this.getReceiverUid();

  const modal = await this.modalCtrl.create({
    component: ChatModalComponent,
    componentProps: {
      receiverUid: receiverUid,
      idappointment: this.idappointment
    }
  });

  await modal.present();
}

private async getReceiverUid(): Promise<string> {
  try {
    const prof = await this.appointmentService.getUserProfessionalProfileByAppointment(this.idappointment).toPromise();
    const basic = await this.appointmentService.getUserBasicProfileByAppointment(this.idappointment).toPromise();
    const uid = await this.getCurrentUid();

    // Si yo soy el profesional, el otro es el paciente
    if (prof && prof.UID === uid && basic) return basic.UID;
    if (basic && basic.UID === uid && prof) return prof.UID;

    return '';
  } catch (e) {
    console.error('No se pudo obtener UID receptor:', e);
    return '';
  }
}

}
