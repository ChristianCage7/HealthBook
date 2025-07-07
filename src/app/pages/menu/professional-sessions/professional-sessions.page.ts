import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService, Appointment } from 'src/app/shared/services/appointment.service';
import { UserService } from 'src/app/shared/services/user.service';
import { AlertController } from '@ionic/angular';
import { ToastService } from 'src/app/shared/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-professional-sessions',
  templateUrl: './professional-sessions.page.html',
  styleUrls: ['./professional-sessions.page.scss'],
  standalone: false
})
export class ProfessionalSessionsPage implements OnInit {
  appointments: Appointment[] = [];
  pendingAppointments: Appointment[] = [];
  confirmedAppointments: Appointment[] = [];
  idprofessional!: number;
  uid!: string;
  loading = true;

  constructor(
    private router: Router,
    private appointmentService: AppointmentService,
    private userService: UserService,
    private alertCtrl: AlertController,
    private toastService: ToastService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loading = true;
    this.userService.getCurrentUser().subscribe({
      next: user => {
        this.idprofessional = user.idprofessional;
        this.uid = user.uid;
        this.loadAppointments();
      },
      error: err => {
        console.error('Error obteniendo usuario:', err);
        this.loading = false;
      }
    });
  }

  loadAppointments() {
    this.appointmentService.getProfessionalAppointments(this.idprofessional).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.pendingAppointments = appointments.filter(a => a.status === 0);
        this.confirmedAppointments = appointments.filter(a => a.status === 1);
        this.loading = false;
      },
      error: err => {
        console.error('Error cargando citas:', err);
        this.loading = false;
      }
    });
  }

  async confirm(id: number) {
    const confirmed = await this.presentConfirmation('¿Estás seguro de aprobar esta cita?');
    if (!confirmed) return;

    this.appointmentService.confirmAppointment(id).subscribe({
      next: () => {
        this.loadAppointments();
        this.toastService.show('Cita aprobada exitosamente.', 'Éxito', 'success');
      },
      error: () => this.toastService.show('Error al aprobar la cita.', 'Error', 'error')
    });
  }

  async reject(id: number) {
    const confirmed = await this.presentConfirmation('¿Deseas rechazar esta cita? Esta acción no se puede revertir');
    if (!confirmed) return;

    this.appointmentService.rejectAppointment(id).subscribe({
      next: () => {
        this.loadAppointments();
        this.toastService.show('Cita rechazada correctamente.', 'Éxito', 'success');
      },
      error: () => this.toastService.show('Error al rechazar la cita.', 'Error', 'error')
    });
  }

  async cancel(id: number) {
    const confirmed = await this.presentConfirmation('¿Cancelar esta cita? Esta acción no se puede revertir');
    if (!confirmed) return;

    this.appointmentService.cancelAppointment(id).subscribe({
      next: () => {
        this.loadAppointments();
        this.toastService.show('Cita cancelada.', 'Aviso', 'info');
      },
      error: () => this.toastService.show('No se pudo cancelar la cita.', 'Error', 'error')
    });
  }

goToCall(appointment: Appointment) {
  if (!appointment.sessionId || !this.uid) {
    this.toastService.show('Faltan datos para iniciar videollamada.', 'Error', 'error');
    return;
  }

  // 1. Primero generar token
  this.http.post(`${environment.apiUrl}/call/token?sessionId=${appointment.sessionId}&role=PUBLISHER`, {}, { responseType: 'text' })
    .subscribe({
      next: (token) => {
        // 2. Luego registrar participante
        this.http.post(`${environment.apiUrl}/call/join`, {
          sessionId: appointment.sessionId,
          token: token,
          uid: this.uid
        }).subscribe({
          next: () => {
            // 3. Navegar con token y datos correctos
            this.router.navigate(['/call'], {
              state: {
                sessionId: appointment.sessionId,
                token: token,
                idappointment: appointment.idappointment,
                role: 'PROFESSIONAL'
              }
            });
          },
          error: err => {
            console.error('Error al registrar al participante:', err);
            this.toastService.show('No se pudo registrar al usuario en la videollamada.', 'Error', 'error');
          }
        });
      },
      error: err => {
        console.error('Error al generar token:', err);
        this.toastService.show('No se pudo generar el token de videollamada.', 'Error', 'error');
      }
    });
}

  formatDateTime(date: string, time: string): string {
    const datetime = new Date(`${date}T${time}`);
    return datetime.toLocaleString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async presentConfirmation(message: string): Promise<boolean> {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar acción',
      message,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Aceptar', role: 'confirm' }
      ]
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }
}
