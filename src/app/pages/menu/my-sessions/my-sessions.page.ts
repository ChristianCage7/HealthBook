import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CallService } from 'src/app/shared/services/call.service';

@Component({
  selector: 'app-my-sessions',
  templateUrl: './my-sessions.page.html',
  styleUrls: ['./my-sessions.page.scss'],
  standalone: false
})
export class MySessionsPage implements OnInit {
  public static sessionGlobal = '';

  constructor(
        private callService: CallService,
    private router: Router
  ) { }

  ngOnInit() {
  }

 iniciarLlamadaProfesional() {
    this.callService.createSession().subscribe(sessionId => {
      MySessionsPage.sessionGlobal = sessionId;
      this.callService.generateToken(sessionId, 'PUBLISHER').subscribe(token => {
        this.router.navigate(['/call-professional'], {
          state: { token, sessionId }
        });
      });
    });
  }

  ingresarComoPaciente() {
    const sessionId = MySessionsPage.sessionGlobal;
    if (!sessionId) {
      alert('La sesión aún no ha sido creada.');
      return;
    }

    this.callService.generateToken(sessionId, 'SUBSCRIBER').subscribe(token => {
      this.router.navigate(['/call-patient'], {
        state: { token, sessionId }
      });
    });
  }
}
