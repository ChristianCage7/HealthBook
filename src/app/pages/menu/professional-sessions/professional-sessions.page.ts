import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService, Appointment } from 'src/app/shared/services/appointment.service';
import { UserService } from 'src/app/shared/services/user.service';
import { AlertController, ModalController } from '@ionic/angular';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ChatModalComponent } from 'src/app/shared/components/chat-modal/chat-modal.component';

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

  constructor(
    private router: Router,
    private appointmentService: AppointmentService,
    private userService: UserService,
    private alertCtrl: AlertController,
    private toastService: ToastService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.userService.getCurrentUser().subscribe({
      next: user => {
        console.log('Usuario recibido:', user);
        this.idprofessional = user.idprofessional; // << Asegúrate que este es el campo correcto
        console.log('ID del profesional:', this.idprofessional);
        this.loadAppointments();
      },
      error: err => console.error('Error obteniendo usuario:', err)
    });
  }

  loadAppointments() {
    this.appointmentService.getProfessionalAppointments(this.idprofessional).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.pendingAppointments = appointments.filter(a => a.status === 0);
        this.confirmedAppointments = appointments.filter(a => a.status === 1);
      },
      error: err => console.error('Error cargando citas:', err)
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
    this.router.navigate(['/call'], {
      state: {
        sessionId: appointment.sessionId,
        token: appointment.tokenProfessional
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

  async openChatModal(appointment: Appointment) {
    try {
      const profile = await this.appointmentService
        .getUserBasicProfileByAppointment(appointment.idappointment)
        .toPromise();

      console.log('Perfil paciente recibido:', profile);

      if (!profile || !profile.UID) {
        throw new Error('Perfil no válido o sin UID');
      }

      const modal = await this.modalCtrl.create({
        component: ChatModalComponent,
        componentProps: {
          receiverUid: profile.UID,
          idappointment: appointment.idappointment
        },
      });

      await modal.present();

    } catch (err) {
      console.error('No se pudo obtener el perfil del paciente:', err);
      alert('No se pudo abrir el chat porque el perfil del paciente no está disponible.');
    }
  }



}
