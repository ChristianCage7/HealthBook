import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CalendarEvent, CalendarMonthViewBeforeRenderEvent } from 'angular-calendar';
import { AvailabilityModalComponent } from '../availability-modal/availability-modal.component';
import { AvailabilityService } from 'src/app/shared/services/availability.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-manage-availability',
  templateUrl: './manage-availability.page.html',
  styleUrls: ['./manage-availability.page.scss'],
  standalone: false,
})
export class ManageAvailabilityPage implements OnInit {
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];

  constructor(
    private modalCtrl: ModalController,
    private availabilityService: AvailabilityService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loadAvailabilities();
  }

  async openAvailabilityModal(preselectedDate?: Date): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AvailabilityModalComponent,
      componentProps: {
        preselectedDate: preselectedDate || null
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.refresh) {
      this.loadAvailabilities();
    }
  }

  onDayClick({ day }: { day: { date: Date } }) {
    if (!this.isPast(day.date)) {
      this.openAvailabilityModal(day.date);
    }
  }

  isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  beforeMonthViewRender(renderEvent: CalendarMonthViewBeforeRenderEvent): void {
    renderEvent.body.forEach(cell => {
      if (this.isPast(cell.date)) {
        cell.cssClass = 'cal-day-disabled';
      }
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];  // "2025-06-13"
  }

  loadAvailabilities() {
    this.userService.getCurrentUser().subscribe(user => {
      const idprofessional = user?.idprofessional;
      if (!idprofessional) { return; }

      const dateStr = this.formatDate(this.viewDate);

      this.availabilityService
        .getAvailability(idprofessional, dateStr)
        .subscribe(data => {
          this.events = data.map(item => ({
            start: new Date(`${item.day}T${item.hour}`),
            title: 'Disponible'
          }));
        }, err => {
          console.error('Error al cargar disponibilidad', err);
        });
    });
  }

}
