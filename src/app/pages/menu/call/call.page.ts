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
  role: 'patient' | 'professional' = 'patient'; // Ajusta dinámicamente según el usuario

  async ngOnInit() {
    this.OV = new OpenVidu();
    this.session = this.OV.initSession();

    this.session.on('streamCreated', (event: StreamEvent) => {
      this.session.subscribe(
        event.stream,
        this.subscriberContainer.nativeElement
      );
    });

    this.token = await this.getToken(this.sessionId);

    this.session
      .connect(this.token, { clientData: this.role })
      .then(async () => {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        const videoElement = document.createElement('video');
        videoElement.autoplay = true;
        videoElement.muted = true;
        videoElement.playsInline = true;
        videoElement.srcObject = mediaStream;
        this.publisherContainer.nativeElement.appendChild(videoElement);

        this.publisher = this.OV.initPublisher(undefined, {
          videoSource: mediaStream.getVideoTracks()[0],
          audioSource: mediaStream.getAudioTracks()[0],
          insertMode: 'APPEND',
        });

        this.session.publish(this.publisher);
      })
      .catch((error) => {
        console.error('Error al conectar con la sesión:', error);
      });
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

    // ⚠️ Si ya existe, 409 está bien
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
  }
}
