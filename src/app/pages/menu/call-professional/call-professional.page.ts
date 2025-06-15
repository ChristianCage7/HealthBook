import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { OpenVidu, Session, StreamEvent, Publisher, Subscriber } from 'openvidu-browser';

@Component({
  selector: 'app-call-professional',
  templateUrl: './call-professional.page.html',
  styleUrls: ['./call-professional.page.scss'],
  standalone: false
})
export class CallProfessionalPage implements OnInit, OnDestroy {
  sessionId: string = '';
  token: string = '';

  OV!: OpenVidu;
  session!: Session;
  publisher!: Publisher;
  subscribers: Subscriber[] = [];

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state;
    if (state) {
      this.sessionId = state['sessionId'];
      this.token = state['token'];
    }
  }

  ngOnInit() {
    this.initializeSession();
  }

  ngOnDestroy() {
    if (this.session) {
      this.session.disconnect();
    }
  }

  initializeSession() {
    this.OV = new OpenVidu();
    this.session = this.OV.initSession();

    // Evento cuando alguien se conecta
    this.session.on('streamCreated', (event: StreamEvent) => {
      const subscriber = this.session.subscribe(event.stream, undefined);
      this.subscribers.push(subscriber);
    });

    // Conectar a la sesión
    this.session.connect(this.token)
      .then(() => {
        this.publisher = this.OV.initPublisher(undefined, {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: true,
          publishVideo: true,
          resolution: '640x480',
          frameRate: 30,
          insertMode: 'APPEND',
          mirror: false
        });

        this.session.publish(this.publisher);
      })
      .catch(error => {
        console.error('Error al conectar con la sesión:', error);
        alert('No se pudo conectar con la videollamada');
      });
  }
}
