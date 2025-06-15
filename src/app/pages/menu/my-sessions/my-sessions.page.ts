import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment, AppointmentService } from 'src/app/shared/services/appointment.service';
import { CallService } from 'src/app/shared/services/call.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-my-sessions',
  templateUrl: './my-sessions.page.html',
  styleUrls: ['./my-sessions.page.scss'],
  standalone: false
})
export class MySessionsPage implements OnInit {
  public static sessionGlobal = '';
  appointments: Appointment[] = [];
  loading = true;


  constructor(
    private callService: CallService,
    private router: Router,
    private appointmentService: AppointmentService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: user => {
        this.loadAppointments(user.id);
      },
      error: err => {
        console.error('No pude cargar usuario', err);
        this.loading = false;
      }
    });
  }

    private loadAppointments(userId: number) {
    this.appointmentService.getUserAppointments(userId).subscribe({
      next: appts => {
        this.appointments = appts;
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar citas', err);
        this.loading = false;
      }
    });
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