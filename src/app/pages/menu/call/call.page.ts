import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  OpenVidu,
  Session,
  Publisher,
  StreamEvent,
  Subscriber,
} from 'openvidu-browser';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-call',
  templateUrl: './call.page.html',
  styleUrls: ['./call.page.scss'],
  standalone: false,
})
export class CallPage implements OnInit, OnDestroy, AfterViewInit {
  OV!: OpenVidu;
  session!: Session;
  publisher!: Publisher;
  subscribers: Subscriber[] = [];

  sessionId!: string;
  token!: string;
  role!: string;
  idappointment!: number;

  hasPublished = false;
  viewReady = false;

  @ViewChild('publisherContainer', { static: false })
  publisherContainer!: ElementRef;

  @ViewChild('subscriberContainer', { static: false })
  subscriberContainer!: ElementRef;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const state = history.state;
    if (!state?.sessionId || !state?.token || !state?.role || !state?.idappointment) {
      console.error('❌ Datos de sesión inválidos. Redirigiendo...');
      this.router.navigate(['/my-sessions']);
      return;
    }

    this.sessionId = state.sessionId;
    this.token = state.token;
    this.role = state.role;
    this.idappointment = state.idappointment;

    console.log('🟣 Iniciando videollamada');
    console.log('Session ID:', this.sessionId);
    console.log('Token:', this.token);
    console.log('Rol:', this.role);
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.initializeSession();
  }

  initializeSession(): void {
    this.OV = new OpenVidu();
    this.session = this.OV.initSession();

    this.session.on('streamCreated', (event: StreamEvent) => {
      const subscriber = this.session.subscribe(event.stream, undefined);

      subscriber.on('videoElementCreated', (e) => {
        const videoEl = e.element as HTMLVideoElement;
        videoEl.style.width = '100%';
        videoEl.style.height = '100%';
        videoEl.style.objectFit = 'cover';
        videoEl.style.display = 'block';
        videoEl.style.backgroundColor = 'black';

        if (this.viewReady && this.subscriberContainer?.nativeElement) {
          this.subscriberContainer.nativeElement.innerHTML = '';
          this.subscriberContainer.nativeElement.appendChild(videoEl);
        } else {
          console.warn('⚠️ subscriberContainer no está listo');
        }
      });

      this.subscribers.push(subscriber);
    });

    this.session.on('streamDestroyed', (event: StreamEvent) => {
      this.subscribers = this.subscribers.filter(
        (s) => s !== event.stream.streamManager
      );
    });

    this.session.connect(this.token)
      .then(() => {
        console.log('🔗 Conectado a la sesión');

        this.publisher = this.OV.initPublisher(undefined, {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: true,
          publishVideo: true,
          resolution: '640x480',
          frameRate: 30,
          insertMode: 'APPEND',
          mirror: false,
        });

        this.publisher.once('accessDenied', () => {
          console.error('🚫 Acceso denegado a cámara o micrófono');
        });

        this.publisher.once('accessAllowed', () => {
          console.log('✅ Acceso concedido a dispositivos');
        });

        this.publisher.once('videoElementCreated', (event) => {
          const videoEl = event.element as HTMLVideoElement;
          videoEl.style.width = '100%';
          videoEl.style.height = '100%';
          videoEl.style.objectFit = 'cover';
          videoEl.style.display = 'block';
          videoEl.style.backgroundColor = 'black';

          if (this.viewReady && this.publisherContainer?.nativeElement) {
            this.publisherContainer.nativeElement.innerHTML = '';
            this.publisherContainer.nativeElement.appendChild(videoEl);
          } else {
            console.warn('⚠️ publisherContainer no está listo');
          }
        });

        this.publisher.once('streamPlaying', () => {
          console.log('🎥 Stream local en reproducción');

          this.session.publish(this.publisher).then(() => {
            this.hasPublished = true;
            console.log('✅ Publicación exitosa tras streamPlaying');
          }).catch(err => {
            console.error('❌ Error al publicar:', err);
          });
        });

        this.session.signal({
          type: 'republish-request',
          data: '',
        });

        this.userService.getUidFromAuth().then(uid => {
          fetch('http://localhost:8080/api/call/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: this.sessionId,
              token: this.token,
              uid: uid
            })
          }).then(res => {
            if (!res.ok) throw new Error('No se pudo registrar al usuario en el backend');
            console.log('✅ Usuario registrado en backend para republish');
          }).catch(err => console.error('❌ Error registrando al usuario:', err));
        });
      })
      .catch((error) => {
        console.error('❌ Error al conectar a la sesión:', error);
      });

    this.session.on('signal:republish-request', () => {
      if (this.publisher && !this.hasPublished) {
        console.log('🔄 Republish solicitado (aún no publicado)');
        this.session.publish(this.publisher).then(() => {
          this.hasPublished = true;
          console.log('✅ Republish exitoso');
        }).catch(err => {
          console.warn('⚠️ Error al republish:', err);
        });
      } else {
        console.log('⚠️ Ya se está publicando, no se repite publish');
      }
    });
  }

  endCall(): void {
    if (this.session) {
      this.session.disconnect();
    }
    this.router.navigate(['/my-sessions']);
  }

  ngOnDestroy(): void {
    if (this.session) {
      this.session.disconnect();
    }
  }
}
