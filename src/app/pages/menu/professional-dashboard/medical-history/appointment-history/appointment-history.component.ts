import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Appointment } from 'src/app/shared/services/appointment.service';

@Component({
  selector: 'app-appointment-history',
  templateUrl: './appointment-history.component.html',
  styleUrls: ['./appointment-history.component.scss'],
  standalone: false
})

export class AppointmentHistoryComponent  implements OnInit {

  @Input() userProfile!: any;
  @Input() appointments!: Appointment[];

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}


  close() {
    this.modalCtrl.dismiss();
  }
}
