import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OpenVidu, Publisher, Session } from 'openvidu-browser';
import { CallService } from 'src/app/shared/services/call.service';
import { MySessionsPage } from '../my-sessions/my-sessions.page';

@Component({
  selector: 'app-call-patient',
  templateUrl: './call-patient.page.html',
  styleUrls: ['./call-patient.page.scss'],
  standalone: false
})
export class CallPatientPage implements OnInit {

  OV!: OpenVidu;
  session!: Session;
  token!: string;
  sessionId!: string;

  constructor(
    private callService: CallService,
    private router: Router
  ) {}

  ngOnInit() {
    this.sessionId = MySessionsPage.sessionGlobal; // ⬅️ usa mismo sessionId
    this.callService.generateToken(this.sessionId, 'SUBSCRIBER').subscribe(token => {
      this.token = token;
      this.joinSession();
    });
  }

  joinSession() {
    this.OV = new OpenVidu();
    this.session = this.OV.initSession();

    this.session.on('streamCreated', (event) => {
      this.session.subscribe(event.stream, 'remote-video');
    });

    this.session.connect(this.token).catch(err => {
      console.error('Error al conectar paciente:', err);
    });
  }
}
