import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { OpenVidu, Session, StreamManager, Publisher } from 'openvidu-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-call-patient',
  templateUrl: './call-patient.page.html',
  styleUrls: ['./call-patient.page.scss'],
  standalone: false,
})
export class CallPatientPage implements OnInit {
  OV!: OpenVidu;
  session!: Session;
  publisher!: Publisher;
  subscribers: StreamManager[] = [];

  token!: string;
  sessionId!: string;

  constructor(private router: Router, private http: HttpClient) {
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
    });

    this.session.on('streamDestroyed', (event: any) => {
      this.subscribers = this.subscribers.filter(
        s => s.stream.streamId !== event.stream.streamId
      );
    });

    this.session
      .connect(this.token)
      .then(() => {
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

        this.session.publish(this.publisher);

        // 👇 Aquí está el fix para mostrar tu video local
        this.publisher.addVideoElement(
          document.getElementById('publisher') as HTMLVideoElement
        );
      })
      .catch((error: any) => {
        console.error('Error al conectar con la sesión:', error);
        alert('No se pudo conectar con la videollamada');
      });
  }
}
