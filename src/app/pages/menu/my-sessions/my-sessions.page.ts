import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from 'src/app/shared/services/appointment.service';
import { UserService } from 'src/app/shared/services/user.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-sessions',
  templateUrl: './my-sessions.page.html',
  styleUrls: ['./my-sessions.page.scss'],
  standalone: false
})
export class MySessionsPage implements OnInit {
  appointments: any[] = [];
  loading = true;
  uid!: string;

  constructor(
    private http: HttpClient,
    private router: Router,
    private appointmentService: AppointmentService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: user => {
        this.uid = user.uid;
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
        this.appointments = appts.map(appt => ({
          ...appt,
          professionalName: 'Profesional'
        }));
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar citas', err);
        this.loading = false;
      }
    });
  }

 iniciarLlamada(appt: any) {
  if (!appt.sessionId || !this.uid) {
    alert('Esta cita aún no tiene una sesión activa. Intenta más tarde.');
    return;
  }

  // 1. Generar token para el paciente
  this.http.post(`${environment.apiUrl}/call/token?sessionId=${appt.sessionId}&role=PUBLISHER`, {}, { responseType: 'text' })
    .subscribe({
      next: (token) => {
        // 2. Registrar participante con token generado
        this.http.post(`${environment.apiUrl}/call/join`, {
          sessionId: appt.sessionId,
          token: token,
          uid: this.uid
        }).subscribe({
          next: () => {
            // 3. Navegar a videollamada con token
            this.router.navigate(['/call'], {
              state: {
                sessionId: appt.sessionId,
                token: token,
                idappointment: appt.idappointment,
                role: 'PATIENT'
              }
            });
          },
          error: err => {
            console.error('Error al registrar al paciente en la llamada:', err);
            alert('No se pudo registrar al usuario en la videollamada.');
          }
        });
      },
      error: err => {
        console.error('Error al generar token:', err);
        alert('No se pudo generar el token para la videollamada.');
      }
    });
}
}
