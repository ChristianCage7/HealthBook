import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationController, ModalController } from '@ionic/angular';
import { ChatModalComponent } from 'src/app/shared/components/chat-modal/chat-modal.component';
import { Appointment, AppointmentService } from 'src/app/shared/services/appointment.service';
import { CallService } from 'src/app/shared/services/call.service';
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
  professionalNames: { [key: number]: string } = {};


  constructor(
    private http: HttpClient,
    private router: Router,
    private appointmentService: AppointmentService,
    private userService: UserService,
    private modalCtrl: ModalController,
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

  /*Carga las citas agendadas*/
  private loadAppointments(userId: number) {
    this.appointmentService.getUserAppointments(userId).subscribe({
      next: appts => {
        this.appointments = appts;
        // Obtener nombre de cada profesional
        appts.forEach(appt => {
          this.appointmentService.getUserProfessionalProfileByAppointment(appt.idappointment).subscribe({
            next: profile => {
              this.professionalNames[appt.idappointment] = `${profile.first_name} ${profile.last_name}`;
            },
            error: err => {
              console.error(`No se pudo obtener nombre del profesional para cita ${appt.idappointment}`, err);
              this.professionalNames[appt.idappointment] = 'Desconocido';
            }
          });
        });
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar citas', err);
        this.loading = false;
      }
    });
  }

  formatDate(date: string): string {
    const d = new Date(date);
    return this.capitalizeFirst(
      d.toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    );
  }

  formatTime(time: string): string {
    const t = new Date(`1970-01-01T${time}`);
    return t.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }


  private capitalizeFirst(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
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

  public translateStatus(status: number): string {
    switch (status) {
      case 0: return 'Pendiente';
      case 1: return 'Confirmada';
      case 2: return 'Rechazada';
      case 3: return 'Cancelada';
      case 4: return 'Completada';
      default: return 'Desconocido';
    }
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


  // 🔁 REFRESH PARA SWIPE
  async handleRefresh(event: CustomEvent) {
    try {
      this.userService.getCurrentUser().subscribe(user => {
        this.loadAppointments(user.id);
      });
    } catch (e) {
      console.error('Error al refrescar citas:', e);
    } finally {
      (event.target as HTMLIonRefresherElement)?.complete();
    }
  }


}
