import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

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

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() { }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  confirm() {
    // aquí luego llamarías tu servicio para crear la cita
    this.modalCtrl.dismiss({ confirmed: true });
  }

}
