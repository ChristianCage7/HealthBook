import { Component, OnInit } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';
import { startOfDay } from 'date-fns';
import { ModalController } from '@ionic/angular';
import { AvailabilityModalComponent } from './availability-modal/availability-modal.component';
import { UserService } from 'src/app/shared/services/user.service';
import { AppointmentModalComponent } from './appointment-modal/appointment-modal/appointment-modal.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  standalone: false
})
export class CalendarPage implements OnInit {
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  isProfessional = false;

  constructor(
    private modalCtrl: ModalController,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.detectUserType();
    this.loadEvents();
  }

  detectUserType() {
    this.userService.isProfessional().subscribe({
      next: (value) => {
        this.isProfessional = value;
      },
      error: () => {
        this.isProfessional = false;
      }
    });
  }

  async openDynamicModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: this.isProfessional ? AvailabilityModalComponent : AppointmentModalComponent,
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.refresh) {
      this.loadEvents();
    }
  }

  loadEvents() {
    this.events = [
      {
        start: startOfDay(new Date()),
        title: this.isProfessional ? 'Disponible' : 'Cita de ejemplo',
      },
    ];
  }
}
