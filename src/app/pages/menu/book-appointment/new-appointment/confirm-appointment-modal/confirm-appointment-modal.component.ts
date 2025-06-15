import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppointmentService, AppointmentRequest } from 'src/app/shared/services/appointment.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-confirm-appointment-modal',
  templateUrl: './confirm-appointment-modal.component.html',
  styleUrls: ['./confirm-appointment-modal.component.scss'],
  standalone: false
})
export class ConfirmAppointmentModalComponent implements OnInit {
  @Input() patient!: { name: string; id: any; };
  @Input() doctor!: { name: string; id: any; };
  @Input() date!: Date;
  @Input() slot!: { startHour: string; endHour: string; };

  loading = false;

  constructor(
    private modalCtrl: ModalController,
    private appointmentService: AppointmentService,
    private toastService: ToastService
  ) { }

  ngOnInit() { }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  confirm() {
    this.loading = true;

    const payload: AppointmentRequest = {
      iduser: this.patient.id,
      idprofessional: this.doctor.id,
      appointmentDate: this.date.toISOString().split('T')[0],      // "YYYY-MM-DD"
      appointmentTime: this.slot.startHour                         // asume "HH:mm:ss"
    };

    this.appointmentService.createWithSession(payload)
      .subscribe({
        next: appointment => {
          this.loading = false;
          // aquí podrías navegar a la sala de videollamada usando appointment.sessionId y tokens
          this.toastService.show('Cita agendada exítosamente', 'Éxito', 'success');
          this.modalCtrl.dismiss({ confirmed: true, appointment });
        },
        error: err => {
          this.loading = false;
          console.error('Error creando cita:', err);
          this.toastService.show('Error creando cita', 'Error', 'error');
          // opcional: mostrar un toast de error
        }
      });
  }
}