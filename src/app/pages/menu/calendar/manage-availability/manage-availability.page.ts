import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CalendarEvent, CalendarMonthViewBeforeRenderEvent } from 'angular-calendar';
import { isSameDay } from 'date-fns';
import { AvailabilityModalComponent } from '../availability-modal/availability-modal.component';
import { AvailabilityService } from 'src/app/shared/services/availability.service';
import { UserService } from 'src/app/shared/services/user.service';
import { MonthViewDay } from 'calendar-utils';
import { EventEmitter } from '@angular/core';
import { addMonths, subMonths } from 'date-fns';
import { forkJoin } from 'rxjs';

interface RawAvail {
  day: string;
  startHour: string;
}

@Component({
  selector: 'app-manage-availability',
  templateUrl: './manage-availability.page.html',
  styleUrls: ['./manage-availability.page.scss'],
  standalone: false,
  encapsulation: ViewEncapsulation.None, // Necesario para que ::ng-deep funcione
})
export class ManageAvailabilityPage implements OnInit {
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  /** Este Subject le avisa al calendario que “refresque” */
  refresh = new EventEmitter<void>();
  loading = false;

  constructor(
    private modalCtrl: ModalController,
    private availabilityService: AvailabilityService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loadAvailabilities();
  }

  previousMonth(): void {
    this.viewDate = subMonths(this.viewDate, 1);
    this.loadAvailabilities();  // recarga eventos para el mes nuevo
  }

  nextMonth(): void {
    this.viewDate = addMonths(this.viewDate, 1);
    this.loadAvailabilities();
  }


  async openAvailabilityModal(preselectedDate?: Date): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AvailabilityModalComponent,
      componentProps: { preselectedDate: preselectedDate || null }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.refresh) {
      this.loadAvailabilities();
    }
  }

  onDayClick(event: { day: MonthViewDay; sourceEvent: any }): void {
    const date = event.day.date;
    if (!this.isPast(date)) {
      this.openAvailabilityModal(date);
    }
  }

  isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  beforeMonthViewRender(renderEvent: CalendarMonthViewBeforeRenderEvent): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    renderEvent.body.forEach(cell => {
      const hasEvent = this.events.some(ev => isSameDay(ev.start, cell.date));

      // 1) Si es pasado, gris y no clicable
      if (cell.date < today) {
        cell.cssClass = this.appendCss(cell.cssClass, 'cal-day-disabled');
      }
      // 2) Si es hoy, lo pintamos “today” (verde)
      else if (isSameDay(cell.date, today)) {
        cell.cssClass = this.appendCss(cell.cssClass, 'cal-today');
      }
      // 3) Si es FUTURO y tiene evento, lila
      else if (hasEvent) {
        cell.cssClass = this.appendCss(cell.cssClass, 'cal-has-events');
      }
    });
  }

  private appendCss(existing: string | undefined, toAdd: string): string {
    return existing ? `${existing} ${toAdd}` : toAdd;
  }

  loadAvailabilities(): void {
  this.loading = true; // ← iniciar spinner

  this.userService.getCurrentUser().subscribe(user => {
    const idp = user?.idprofessional;
    if (!idp) {
      this.loading = false; // ← por si falla aquí
      return;
    }

    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Date[] = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

    const calls = days.map(d =>
      this.availabilityService.getAvailability(
        idp,
        d.toISOString().split('T')[0]
      )
    );

    forkJoin(calls).subscribe({
      next: responses => {
        const all = ([] as any[]).concat(...responses);
        this.events = all.map(item => ({
          start: new Date(`${item.day}T${item.startHour}`),
          title: 'Disponible'
        }));
        this.viewDate = new Date(this.viewDate.getTime()); // repaint
        this.loading = false;
      },
      error: err => {
        console.error('Error al cargar disponibilidades:', err);
        this.loading = false;
      }
    });
  });
}

handleRefresh(event: CustomEvent) {
  this.loadAvailabilities(); // Llama al método que ya tienes
  setTimeout(() => {
    (event.target as HTMLIonRefresherElement)?.complete(); // Cierra animación después de un tiempo fijo
  }, 800); // ajusta el tiempo si es necesario
}

}