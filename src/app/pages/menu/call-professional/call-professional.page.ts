import { Component, OnInit, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { OpenVidu, Session, StreamManager, Publisher, Device } from 'openvidu-browser';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-call-professional',
  templateUrl: './call-professional.page.html',
  styleUrls: ['./call-professional.page.scss'],
  standalone: false,
})
export class CallProfessionalPage implements OnInit, AfterViewInit {
  OV!: OpenVidu;
  session!: Session;
  publisher!: Publisher;
  subscribers: StreamManager[] = [];

  token!: string;
  sessionId!: string;
  userUid!: string;

  localLabel = 'Profesional';
  remoteLabel = 'Paciente';

  @ViewChildren('remoteVideo') remoteVideos!: QueryList<ElementRef>;

  constructor(
    private router: Router,
    private http: HttpClient,
    private userService: UserService
  ) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { token: string; sessionId: string };

    if (state) {
      this.token = state.token;
      this.sessionId = state.sessionId;
    } else {
      alert('No hay información de sesión');
    }
  }

  ngOnInit() {
    this.OV = new OpenVidu();
    this.session = this.OV.initSession();

    this.session.on('streamCreated', (event: any) => {
      console.log('[Profesional] streamCreated:', event.stream.streamId);
      const subscriber = this.session.subscribe(event.stream, undefined);
      this.subscribers.push(subscriber);

      setTimeout(() => {
        const index = this.subscribers.length - 1;
        const videoEl = this.remoteVideos.toArray()[index]?.nativeElement;
        if (videoEl) {
          console.log('[Profesional] Asociando video inmediatamente:', event.stream.streamId);
          subscriber.addVideoElement(videoEl);
        }
      }, 500);
    });

    this.session.on('streamDestroyed', (event: any) => {
      this.subscribers = this.subscribers.filter(
        s => s.stream.streamId !== event.stream.streamId
      );
    });

    this.session.on('signal:republish-request', () => {
      console.log('[Profesional] Recibí señal para republicar');

      if (this.publisher) {
        this.publisher.stream.disposeWebRtcPeer();
        this.publisher.videos?.forEach(video => video.video?.remove());
        this.session.unpublish(this.publisher);
      }

      this.publicarVideo();
    });

    this.userService.getUidFromAuth().then(uid => {
      this.userUid = uid;
      console.log('[Profesional] UID:', uid);

      this.session.connect(this.token).then(() => {
        console.log('[Profesional] Conectado a sesión:', this.sessionId);

        this.publicarVideo();

        this.http.post(`${environment.backendUrl}/api/call/join`, {
          sessionId: this.sessionId,
          uid: this.userUid,
          token: this.token
        }).subscribe(() => {
          console.log('[Profesional] Notificación enviada al backend');
        });
      });
    });
  }

  publicarVideo() {
    this.OV.getDevices().then((devices: Device[]) => {
      const videoDevices = devices.filter(d => d.kind === 'videoinput');

      if (videoDevices.length === 0) {
        console.warn('No hay cámaras disponibles');
        return;
      }

      const selectedDeviceId = videoDevices.length > 1
        ? videoDevices[1].deviceId
        : videoDevices[0].deviceId;

      console.log('📷 Cámaras encontradas:', videoDevices.map(d => d.label));
      console.log('✅ Usando cámara:', selectedDeviceId);

      this.publisher = this.OV.initPublisher(undefined, {
        videoSource: selectedDeviceId,
        audioSource: undefined,
        publishAudio: true,
        publishVideo: true,
        resolution: '640x480',
        frameRate: 30,
        insertMode: 'APPEND',
        mirror: false,
      });

      this.session.publish(this.publisher);
      this.publisher.addVideoElement(
        document.getElementById('publisher') as HTMLVideoElement
      );

      console.log('[Profesional] Cámara publicada correctamente');
    });
  }

  ngAfterViewInit() {
    this.remoteVideos.changes.subscribe(() => {
      this.subscribers.forEach((sub, index) => {
        const videoEl = this.remoteVideos.toArray()[index]?.nativeElement;
        if (videoEl) {
          console.log('[Profesional] Asociando video remoto al DOM:', sub.stream.streamId);
          sub.addVideoElement(videoEl);
        }
      });
    });
  }

  finalizarLlamada() {
    console.log('[Profesional] Finalizando llamada...');
    this.session.disconnect();
    this.router.navigate(['/menu']);
  }
}
