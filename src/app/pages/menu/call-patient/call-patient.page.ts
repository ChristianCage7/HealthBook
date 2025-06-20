import { Component, OnInit, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { OpenVidu, Session, StreamManager, Publisher, Device } from 'openvidu-browser';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-call-patient',
  templateUrl: './call-patient.page.html',
  styleUrls: ['./call-patient.page.scss'],
  standalone: false,
})
export class CallPatientPage implements OnInit, AfterViewInit {
  OV!: OpenVidu;
  session!: Session;
  publisher!: Publisher;
  subscribers: StreamManager[] = [];

  token!: string;
  sessionId!: string;
  userUid!: string;

  localLabel = 'Paciente';
  remoteLabel = 'Profesional';

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
      console.log('[Paciente] streamCreated:', event.stream.streamId);
      const subscriber = this.session.subscribe(event.stream, undefined);
      this.subscribers.push(subscriber);
    });

    this.session.on('streamDestroyed', (event: any) => {
      this.subscribers = this.subscribers.filter(
        s => s.stream.streamId !== event.stream.streamId
      );
    });

    this.session.on('signal:republish-request', () => {
      console.log('[Paciente] Recibí republish-request');

      this.session.remoteConnections.forEach(conn => {
        const stream = (conn as any).stream;
        if (stream && !this.subscribers.find(s => s.stream.streamId === stream.streamId)) {
          const subscriber = this.session.subscribe(stream, undefined);
          this.subscribers.push(subscriber);
        }
      });
    });

    this.userService.getUidFromAuth().then(uid => {
      this.userUid = uid;
      console.log('[Paciente] UID:', uid);

      this.session.connect(this.token).then(() => {
        console.log('[Paciente] Conectado a sesión:', this.sessionId);

        this.OV.getDevices().then((devices: Device[]) => {
          const videoDevices = devices.filter(d => d.kind === 'videoinput');

          if (videoDevices.length === 0) {
            console.warn('No hay cámaras disponibles');
            return;
          }

          const selectedDeviceId = videoDevices.length > 1
            ? videoDevices[1].deviceId  // Segunda cámara
            : videoDevices[0].deviceId; // Solo una disponible

          console.log('📷 Dispositivos encontrados:', videoDevices.map(d => d.label));
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

          console.log('[Paciente] Cámara publicada correctamente');

          this.http.post(`${environment.backendUrl}/api/call/join`, {
            sessionId: this.sessionId,
            uid: this.userUid,
            token: this.token
          }).subscribe(() => {
            console.log('[Paciente] Notificación enviada al backend');
          });
        });
      });
    });
  }

  ngAfterViewInit() {
    this.remoteVideos.changes.subscribe(() => {
      this.subscribers.forEach((sub, index) => {
        const videoEl = this.remoteVideos.toArray()[index]?.nativeElement;
        if (videoEl) sub.addVideoElement(videoEl);
      });
    });
  }
}
