import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-appointment-modal',
  templateUrl: './appointment-modal.component.html',
  styleUrls: ['./appointment-modal.component.scss'],
  standalone: false
})
export class AppointmentModalComponent {
  appointmentDate: string = '';
  appointmentTime: string = '';

  constructor(private modalCtrl: ModalController) {}

  dismiss(refresh: boolean = false) {
    this.modalCtrl.dismiss({ refresh });
  }

  save() {
    // Aquí puedes enviar los datos al backend
    this.dismiss(true);
  }
}
