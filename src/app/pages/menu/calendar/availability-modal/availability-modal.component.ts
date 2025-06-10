import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AvailabilityService } from 'src/app/shared/services/availability.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-availability-modal',
  templateUrl: './availability-modal.component.html',
  styleUrls: ['./availability-modal.component.scss'],
  standalone: false
})
export class AvailabilityModalComponent implements OnInit {
  @Input() preselectedDate?: Date;

  selectedTime: string = '';
  selectedDate: string = '';
  selectedHours: string[] = [];

  constructor(
    private modalCtrl: ModalController,
    private availabilityService: AvailabilityService,
    private userService: UserService
  ) {}

  ngOnInit() {
    if (this.preselectedDate) {
      this.selectedDate = this.preselectedDate.toISOString().split('T')[0];
    }
  }

  addHour() {
    const hour = this.selectedTime.split('T')[1]?.split('.')[0];
    if (hour && !this.selectedHours.includes(hour)) {
      this.selectedHours.push(hour);
    }
  }

  removeHour(hour: string) {
    this.selectedHours = this.selectedHours.filter(h => h !== hour);
  }

async saveAvailability() {
  try {
    const user = await this.userService.getCurrentUser().toPromise();
    const idprofessional = user?.idprofessional;

    if (typeof idprofessional !== 'number') {
      console.error('❌ idprofessional inválido o no definido:', idprofessional);
      return;
    }

    const requests = this.selectedHours.map(hour => ({
      idprofessional,
      day: this.selectedDate,
      hour,
      available: true
    }));

    console.log('✅ Payload a enviar:', requests);

    await Promise.all(
      requests.map(payload =>
        this.availabilityService.createAvailability(payload).toPromise()
      )
    );

    this.dismiss(true);
  } catch (err) {
    console.error('❌ Error al guardar disponibilidades:', err);
  }
}


  dismiss(refresh: boolean = false) {
    this.modalCtrl.dismiss({ refresh });
  }
}
