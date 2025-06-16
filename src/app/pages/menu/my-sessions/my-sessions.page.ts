import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from 'src/app/shared/services/appointment.service';
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
  appointments: any[] = [];
  loading = true;

  constructor(
    private callService: CallService,
    private router: Router,
    private appointmentService: AppointmentService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: user => this.loadAppointments(user.id),
      error: err => {
        console.error('No pude cargar usuario', err);
        this.loading = false;
      }
    });
  }

  private loadAppointments(userId: number) {
    this.appointmentService.getUserAppointments(userId).subscribe({
      next: appts => {
        const enriched = appts.map(appt => ({
          ...appt,
          professionalName: 'Profesional' // Evitamos error 500 del backend
        }));

        this.appointments = enriched;
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar citas', err);
        this.loading = false;
      }
    });
  }

  iniciarLlamada(appt: any) {
    if (!appt.sessionId || !appt.tokenPatient) {
      alert('Esta cita no tiene sesión activa.');
      return;
    }

    this.router.navigate(['/call-patient'], {
      state: {
        token: appt.tokenPatient,
        sessionId: appt.sessionId
      }
    });
  }
}
