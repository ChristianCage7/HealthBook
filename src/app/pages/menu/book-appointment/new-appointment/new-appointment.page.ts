import { Component, OnInit } from '@angular/core';
import { MonthViewDay } from 'calendar-utils';
import { AvailabilityService } from 'src/app/shared/services/availability.service';
import { ActivatedRoute } from '@angular/router';
import { CalendarMonthViewBeforeRenderEvent } from 'angular-calendar';
import { addMonths } from 'date-fns';
import { AlertController } from '@ionic/angular'; 

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
  availabilities: { startHour: string; endHour: string; [k: string]: any }[] = [];

  selectedSlot: any = null;
  

  constructor(
    private availabilityService: AvailabilityService,
    private route: ActivatedRoute,
    private alertCtrl: AlertController
  ) { }

  /**
   * Ciclo de vida OnInit:
   * - Lee el parámetro 'id' de la ruta para identificar al profesional.
   * - Inicializa la fecha seleccionada a hoy.
   * - Carga las franjas disponibles para hoy.
   */
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) {
        console.error('No llegó el id en la ruta');
        return;
      }
      this.idprofessional = +id;
      this.selectedDate = this.viewDate;
      this.loadAvailability();
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
    const today = new Date(); today.setHours(0,0,0,0);
    if (d < today) return;

    this.selectedDate = d;
    this.viewDate     = d;
    this.date         = d.toISOString().split('T')[0];
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
        err   => {
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
    console.log('Slot seleccionado:', this.selectedSlot);
  }


  /** Abre un modal de placeholder por ahora */
  async schedule() {
    const alert = await this.alertCtrl.create({
      header: 'Agendar cita',
      subHeader: 'Slot seleccionado',
      message: `
        Día: ${this.selectedDate.toLocaleDateString()}<br>
        Hora: ${this.selectedSlot.startHour}
      `,
      buttons: ['OK']
    });
    await alert.present();
  }
  
}
