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
  sessionId = 'HealthbookTestSession';
  token!: string;
  role: 'patient' | 'professional' = 'patient';

  async ngOnInit() {
    try {
      console.log('🟢 Solicitando permisos con getUserMedia...');
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log('✅ Permisos concedidos');

      console.log('🟢 Iniciando OpenVidu');
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
    if (this.session) {
      this.session.disconnect();
    }
  }
}
