import { Component, OnInit, OnDestroy } from '@angular/core';
import { OpenVidu, Session, Publisher } from 'openvidu-browser';

@Component({
  selector: 'app-video-test',
  templateUrl: './video-test.component.html',
  styleUrls: ['./video-test.component.scss'],
  standalone: false
})
export class VideoTestComponent implements OnInit, OnDestroy {
  OV!: OpenVidu;
  session!: Session;
  publisher!: Publisher;

  async ngOnInit(): Promise<void> {
    this.OV = new OpenVidu();
    this.session = this.OV.initSession();

    const OPENVIDU_URL = 'http://localhost:4443';
    const OPENVIDU_SECRET = 'Healthbook123'; // Cambia si usas otro secret

    // Crear sesión
    const sessionRes = await fetch(`${OPENVIDU_URL}/openvidu/api/sessions`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + OPENVIDU_SECRET),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const sessionId = (await sessionRes.json()).id;

    // Crear token
    const tokenRes = await fetch(`${OPENVIDU_URL}/openvidu/api/sessions/${sessionId}/connection`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa('OPENVIDUAPP:' + OPENVIDU_SECRET),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const token = (await tokenRes.json()).token;

    // Crear publisher
    this.publisher = this.OV.initPublisher('publisher', {
      audioSource: undefined,
      videoSource: undefined,
      publishAudio: true,
      publishVideo: true,
      resolution: '640x480',
      insertMode: 'APPEND'
    });

    // Conectar y publicar
    this.session.connect(token).then(() => {
      this.session.publish(this.publisher);
    }).catch(error => {
      console.error('Error al conectar a la sesión:', error);
    });
  }

  ngOnDestroy(): void {
    if (this.session) {
      this.session.disconnect();
    }
  }
}
