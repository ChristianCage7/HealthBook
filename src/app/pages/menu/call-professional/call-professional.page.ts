import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OpenVidu, Publisher, Session } from 'openvidu-browser';
import { CallService } from 'src/app/shared/services/call.service';

@Component({
  selector: 'app-call-professional',
  templateUrl: './call-professional.page.html',
  styleUrls: ['./call-professional.page.scss'],
  standalone: false
})
export class CallProfessionalPage implements OnInit {
 OV!: OpenVidu;
  session!: Session;
  publisher!: Publisher;
  token!: string;
  sessionId!: string;

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state || {};
    this.token = state['token'];
    this.sessionId = state['sessionId'];
  }

  ngOnInit() {
    this.joinSession();
  }

  joinSession() {
    this.OV = new OpenVidu();
    this.session = this.OV.initSession();

    this.session.on('streamCreated', (event) => {
      this.session.subscribe(event.stream, 'remote-video');
    });

    this.session.connect(this.token)
      .then(() => {
        this.publisher = this.OV.initPublisher('local-video', {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: true,
          publishVideo: true,
          resolution: '640x480',
          frameRate: 30,
          insertMode: 'APPEND',
        });
        this.session.publish(this.publisher);
      })
      .catch(err => console.error('Error connecting to session', err));
  }
}
