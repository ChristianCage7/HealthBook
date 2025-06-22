import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationController, ModalController } from '@ionic/angular';
import { ChatModalComponent } from 'src/app/shared/components/chat-modal/chat-modal.component';
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
    private userService: UserService,
    private modalCtrl: ModalController,
    private animationCtrl: AnimationController,
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

  /*Carga las citas agendadas*/
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

  async openChatModal(appointment: Appointment) {
    try {
      const profile = await this.appointmentService
        .getUserProfessionalProfileByAppointment(appointment.idappointment)
        .toPromise();

      console.log('Perfil profesional recibido:', profile);

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
      console.error('No se pudo obtener el perfil profesional:', err);
      alert('No se pudo abrir el chat porque el perfil del profesional no está disponible.');
    }
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
