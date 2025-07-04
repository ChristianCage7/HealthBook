import { Component, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { MonthViewDay } from 'calendar-utils';
import { AvailabilityService } from 'src/app/shared/services/availability.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarMonthViewBeforeRenderEvent } from 'angular-calendar';
import { addMonths, subMonths, isSameDay } from 'date-fns'; // ← añadimos `subMonths` e `isSameDay`
import { ModalController } from '@ionic/angular';
import { ConfirmAppointmentModalComponent } from './confirm-appointment-modal/confirm-appointment-modal.component';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-new-appointment',
  templateUrl: './new-appointment.page.html',
  styleUrls: ['./new-appointment.page.scss'],
  standalone: false,
  encapsulation: ViewEncapsulation.None
})
export class NewAppointmentPage implements OnInit {
  /** ID del profesional, leído desde la URL */
  idprofessional!: number;

  /** Fecha actualmente mostrada en el calendario (mes) */
  viewDate: Date = new Date();

  /** Fecha en formato ISO (YYYY-MM-DD) para pasar al backend */
  date: string = this.viewDate.toISOString().split('T')[0];

  /** Día del calendario seleccionado por el usuario */
  selectedDate: Date = this.viewDate;

  /** Franjas horarias devueltas por el backend para la fecha seleccionada */
  availabilities: { startHour: string; endHour: string;[k: string]: any }[] = [];

  /** Evento seleccionado (una franja horaria) */
  selectedSlot: any = null;

  /** Información del paciente logueado */
  currentUser!: { id: any; name: string; };

  /** Información del profesional */
  currentPro!: { id: number; name: string; };

  /** Lista de eventos para el calendario mensual */
  events: { start: Date; title: string }[] = [];

  refresh = new EventEmitter<void>();
  loading = false;

  constructor(
    private availabilityService: AvailabilityService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private userService: UserService,
    private router: Router
  ) { }

  /**
   * Ciclo de vida OnInit:
   * - Lee el parámetro 'id' de la ruta para identificar al profesional.
   * - Inicializa la fecha seleccionada a hoy.
   * - Carga las franjas disponibles para hoy.
   */
  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const profFromState = nav?.extras.state?.['professional'];
    if (profFromState) {
      this.currentPro = {
        id: profFromState.idprofessional,
        name: `${profFromState.first_name} ${profFromState.last_name}`
      };
      this.idprofessional = profFromState.idprofessional;
      this.date = this.selectedDate.toISOString().split('T')[0];
      this.loadAvailability();
      this.loadAllAvailabilities(); // ← carga eventos para el mes actual
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) return;
      this.idprofessional = +id;
      this.loadAvailability();
      this.loadAllAvailabilities(); // ← también si entra por URL
    });

    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`
      };
    });
  }

  // Método auxiliar para saber si una fecha está en el pasado
  isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  /** Flecha mes anterior */
  previousMonth() {
    this.viewDate = subMonths(this.viewDate, 1); // ← cambiar a subMonths
    this.loadAllAvailabilities();
  }

  /** Flecha mes siguiente */
  nextMonth() {
    this.viewDate = addMonths(this.viewDate, 1);
    this.loadAllAvailabilities();
  }

  /** Al hacer clic en día: actualizar fecha seleccionada + obtener franjas horarias */
  onDayClick(event: { day: MonthViewDay; sourceEvent: MouseEvent | KeyboardEvent }): void {
    const d = event.day.date;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (d < today) return;

    this.selectedDate = d;
    this.viewDate = d;
    this.date = d.toISOString().split('T')[0];
    this.loadAvailability();

    // Fuerza la actualización visual para que aplique .selected-day
    this.refreshView();
  }

  refreshView(): void {
    this.viewDate = new Date(this.viewDate); // ⚠️ Fuerza redibujado del calendario
  }

  /**
   * Antes de renderizar el mes, recorre cada celda y aplica estilos según condiciones:
   * - gris si es pasado
   * - verde si es hoy
   * - lila si tiene eventos (horas disponibles)
   * - resalta el día seleccionado
   */
  beforeMonthViewRender(renderEvent: CalendarMonthViewBeforeRenderEvent): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    renderEvent.body.forEach(cell => {
      const hasEvent = this.events.some(ev => isSameDay(ev.start, cell.date));
      const isSelected = this.selectedDate && isSameDay(cell.date, this.selectedDate);
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

      // 4) Si está seleccionado, color morado (independiente del resto)
      if (isSelected) {
        cell.cssClass = this.appendCss(cell.cssClass, 'selected-day');
      }
    });

  }

  private appendCss(existing: string | undefined, toAdd: string): string {
    return existing ? `${existing} ${toAdd}` : toAdd;
  }


  /** Llama al backend y obtiene las franjas para el día actual */
  private loadAvailability(): void {
    if (!this.idprofessional) return;
    this.availabilityService
      .getAvailability(this.idprofessional, this.date)
      .subscribe(
        slots => this.availabilities = slots,
        err => {
          console.error('Error al cargar disponibilidad', err);
          this.availabilities = [];
        }
      );
  }

  /** Llama al backend para obtener disponibilidad de TODO el mes actual */
  private loadAllAvailabilities(): void {
    this.loading = true;
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: Date[] = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

    const calls = days.map(d =>
      this.availabilityService.getAvailability(
        this.idprofessional,
        d.toISOString().split('T')[0]
      )
    );

    Promise.all(calls.map(obs => obs.toPromise()))
      .then(responses => {
        const all = ([] as any[]).concat(...responses);
        this.events = all.map(item => ({
          start: new Date(`${item.day}T${item.startHour}`),
          title: 'Disponible'
        }));
        this.loading = false; // ✅ se apaga el spinner al terminar
      })
      .catch(err => {
        console.error('Error al cargar eventos mensuales', err);
        this.loading = false; // ✅ se apaga el spinner si hay error
      });
  }


  /** Al seleccionar un slot horario, se marca para agendar */
  selectSlot(slot: any): void {
    this.selectedSlot = slot;
  }

  /** Muestra modal de confirmación con los datos seleccionados */
  async schedule(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ConfirmAppointmentModalComponent,
      componentProps: {
        patient: this.currentUser,
        doctor: this.currentPro,
        date: this.selectedDate,
        slot: this.selectedSlot
      },
      cssClass: 'confirmar-cita-sheet',
      breakpoints: [0, 0.7, 1],
      initialBreakpoint: 0.7,
      handle: true
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.confirmed) {
      console.log('Usuario confirmó la cita');
    }
  }

  //Swipe para refrescar
  async handleRefresh(event: CustomEvent) {
    try {
      this.date = this.selectedDate.toISOString().split('T')[0];
      this.loadAvailability();
      this.loadAllAvailabilities();
    } catch (e) {
      console.error('Error al refrescar:', e);
    } finally {
      const refresher = event.target as HTMLIonRefresherElement;
      refresher.complete(); // ✅ Sin error de TypeScript
    }
  }
}


