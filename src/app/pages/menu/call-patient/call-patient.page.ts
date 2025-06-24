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
      const subscriber = this.session.subscribe(event.stream, undefined);
      this.subscribers.push(subscriber);

      setTimeout(() => {
        const index = this.subscribers.length - 1;
        const videoEl = this.remoteVideos.toArray()[index]?.nativeElement;
        if (videoEl) {
          subscriber.addVideoElement(videoEl);
        }
      }, 500);
    });

    this.session.on('streamDestroyed', (event: any) => {
      this.subscribers = this.subscribers.filter(
        s => s.stream.streamId !== event.stream.streamId
      );
    });

    this.session.on('signal:republish-request', (event: any) => {
      if (event.from?.connectionId === this.session.connection?.connectionId) return;

      if (this.publisher) {
        this.publisher.stream.disposeWebRtcPeer();
        this.publisher.videos?.forEach(video => video.video?.remove());
        this.session.unpublish(this.publisher);
      }

      this.publicarVideo();
    });

    this.userService.getUidFromAuth().then(uid => {
      this.userUid = uid;

      this.session.connect(this.token).then(() => {
        this.publicarVideo();

        this.http.post(`${environment.backendUrl}/api/call/join`, {
          sessionId: this.sessionId,
          uid: this.userUid,
          token: this.token
        }).subscribe(() => {
          this.session.signal({
            type: 'republish-request',
            data: 'refresca tu stream'
          });
        });
      });
    });
  }

  publicarVideo() {
    this.OV.getDevices().then((devices: Device[]) => {
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      const selectedDeviceId = videoDevices[0]?.deviceId;

      this.publisher = this.OV.initPublisher(undefined, {
        videoSource: selectedDeviceId ?? false,
        audioSource: undefined,
        publishAudio: true,
        publishVideo: !!selectedDeviceId,
        resolution: '640x480',
        frameRate: 30,
        insertMode: 'APPEND',
        mirror: false,
      });

      this.publisher.once('accessDenied', (e) => {
        console.warn('Acceso denegado a cámara o micrófono:', e);
      });

      this.publisher.once('accessAllowed', () => {
        this.session.publish(this.publisher);
        this.publisher.addVideoElement(
          document.getElementById('publisher') as HTMLVideoElement
        );
      });
    }).catch(error => {
      console.error('Error obteniendo dispositivos:', error);
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
