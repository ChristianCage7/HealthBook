import { Component, OnInit } from '@angular/core';
import { MonthViewDay } from 'calendar-utils';
import { AvailabilityService } from 'src/app/shared/services/availability.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarMonthViewBeforeRenderEvent } from 'angular-calendar';
import { addMonths } from 'date-fns';
import { ModalController } from '@ionic/angular';
import { ConfirmAppointmentModalComponent } from './confirm-appointment-modal/confirm-appointment-modal.component';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-new-appointment',
  templateUrl: './new-appointment.page.html',
  styleUrls: ['./new-appointment.page.scss'],
  standalone: false
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

  selectedSlot: any = null;
  currentUser!: { id: any; name: string; };   // paciente
  currentPro!: { id: number; name: string; };     // doctor


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
    // 1) Intentamos leer el objeto profesional que pasamos por state
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
    }

    // 2) Si no veníamos por state, leemos el paramMap
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) return;
      this.idprofessional = +id;
      // aquí podrías volver a buscar el nombre si fuera necesario
      this.loadAvailability();
    });

    // 3) Cargar datos del paciente
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`
      };
    });
  }

  /**
   * Manejador del clic en un día del calendario.
   * @param event Contiene `day: MonthViewDay` y `sourceEvent`.
   * - Ignora días pasados.
   * - Actualiza la fecha seleccionada y recarga disponibilidad.
   */
  onDayClick(event: { day: MonthViewDay; sourceEvent: MouseEvent | KeyboardEvent; }): void {
    const d = event.day.date;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (d < today) return;

    this.selectedDate = d;
    this.viewDate = d;
    this.date = d.toISOString().split('T')[0];
    this.loadAvailability();
  }

  /** Flecha mes anterior */
  previousMonth() {
    this.viewDate = addMonths(this.viewDate, -1);
  }

  /** Flecha mes siguiente */
  nextMonth() {
    this.viewDate = addMonths(this.viewDate, +1);
  }

  /**
   * Antes de renderizar el mes, recorre cada celda y aplica
   * la clase `selected-day` a la que coincide con `selectedDate`.
   */
  beforeMonthViewRender(renderEvent: CalendarMonthViewBeforeRenderEvent): void {
    renderEvent.body.forEach(cell => {
      if (cell.date.toDateString() === this.selectedDate.toDateString()) {
        cell.cssClass = 'selected-day';
      }
    });
  }

  /**
   * (Alternativa no usada en el template actual)
   * Modificador de día que puede usarse como Input en otros casos.
   */
  dayModifier(day: MonthViewDay): void {
    if (day.date.toDateString() === this.selectedDate.toDateString()) {
      day.cssClass = 'selected-day';
    }
  }

  /**
   * Llama al servicio para obtener las franjas del backend
   * según `idprofessional` y `date`. Maneja respuesta y errores.
   */
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

  /**
   * Al seleccionar un slot, puedes redirigir o abrir un modal
   * para confirmar la cita.
   */
  selectSlot(slot: any): void {
    this.selectedSlot = slot;
  }

  async schedule(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ConfirmAppointmentModalComponent,
      componentProps: {
        patient: this.currentUser,
        doctor: this.currentPro,
        date: this.selectedDate,
        slot: this.selectedSlot
      },
      cssClass:          'confirmar-cita-sheet', 
      breakpoints: [0, 0.7, 1],
      initialBreakpoint: 0.7,
      handle: true
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.confirmed) {
      // Aquí podrías llamar tu CallService o el endpoint para crear la cita
      // this.callService.createSession().subscribe(...);
      console.log('Usuario confirmó la cita');
    }
  }

}
