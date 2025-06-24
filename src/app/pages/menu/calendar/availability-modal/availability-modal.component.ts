import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AvailabilityService } from 'src/app/shared/services/availability.service';
import { UserService } from 'src/app/shared/services/user.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
  selector: 'app-availability-modal',
  templateUrl: './availability-modal.component.html',
  styleUrls: ['./availability-modal.component.scss'],
  standalone: false
})
export class AvailabilityModalComponent implements OnInit {
  @Input() preselectedDate?: Date;

  startTime: string = '';
  endTime: string = '';
  patternStartDate: string = '';
  patternEndDate: string = '';
  selectedDays: string[] = [];
  timeBlocks: string[] = [];
  showAvailabilityForm: boolean = true;
  minDate: string = '';
  showPatternOptions: boolean = false;
  loading: boolean = false;
  exceptionDate: string = '';
  exceptionReason: string = '';

  // Días de la semana para patrones
  daysOfWeek = [
    { label: 'Lunes', value: 'monday' },
    { label: 'Martes', value: 'tuesday' },
    { label: 'Miércoles', value: 'wednesday' },
    { label: 'Jueves', value: 'thursday' },
    { label: 'Viernes', value: 'friday' },
    { label: 'Sábado', value: 'saturday' },
    { label: 'Domingo', value: 'sunday' }
  ];

  constructor(
    private modalCtrl: ModalController,
    private availabilityService: AvailabilityService,
    private userService: UserService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    const now = new Date();
    this.minDate = now.toISOString();

    const today = new Date();
    const baseDate = this.preselectedDate ?? today;
    baseDate.setHours(0, 0, 0, 0);

    const isToday = today.toDateString() === baseDate.toDateString();
    this.generateTimeBlocks(isToday); // ← solo muestra bloques desde ahora si es hoy

    // Si llega una fecha preseleccionada, inicializa los pickers
    if (this.preselectedDate) {
      const base = new Date(this.preselectedDate);
      base.setHours(0, 0, 0, 0);
      const iso = base.toISOString();

      this.patternStartDate = iso;
      this.patternEndDate = iso;
      this.exceptionDate = iso;
    }
  }

  // Generación de bloques de tiempo
  generateTimeBlocks(limitFromNow: boolean = false) {
    const blocks: string[] = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    for (let hour = 8; hour <= 20; hour++) {
      const full = `${this.pad(hour)}:00`;
      const half = `${this.pad(hour)}:30`;

      if (!limitFromNow || this.isTimeAfterNow(hour, 0, currentHour, currentMinute)) {
        blocks.push(full);
      }
      if (hour < 20 && (!limitFromNow || this.isTimeAfterNow(hour, 30, currentHour, currentMinute))) {
        blocks.push(half);
      }
    }

    this.timeBlocks = blocks;
  }

  isTimeAfterNow(h: number, m: number, currentH: number, currentM: number): boolean {
    return h > currentH || (h === currentH && m > currentM);
  }


  pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  // Selección de hora de inicio
  onStartTimeSelect(time: string) {
    this.startTime = time;

    // Calcula endTime automáticamente +30min
    const [h, m] = time.split(':').map(Number);
    const start = new Date();
    start.setHours(h, m, 0, 0);
    start.setMinutes(start.getMinutes() + 30);

    const hh = this.pad(start.getHours());
    const mm = this.pad(start.getMinutes());
    this.endTime = `${hh}:${mm}`;
  }

  // Alterna opciones entre disponibilidad y excepciones
  togglePatternOptions(checked: boolean) {
    this.showPatternOptions = checked;
  }

  // Limita las hora dependiendo de la hora del momento
  limitTimeBlocksToCurrentHour() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    this.timeBlocks = this.timeBlocks.filter(time => {
      const [h, m] = time.split(':').map(Number);
      if (h > currentHour) return true;
      if (h === currentHour && m > currentMinute) return true;
      return false;
    });
  }

  // ----- Método para guardar disponibilidad individual y patrón -----
  async saveAvailability() {
    // Guardar disponibilidad individual
    const user = await this.userService.getCurrentUser().toPromise();
    const idprofessional = user?.idprofessional;

    if (!idprofessional || !this.startTime || !this.endTime || !this.preselectedDate) {
      this.toastService.show('Debes completar todos los campos obligatorios', 'danger');
      return;
    }

    // Prepara payload para disponibilidad individual
    const baseDate = this.preselectedDate.toISOString().split('T')[0];
    const start_hour = `${this.startTime}:00`;
    const end_hour = `${this.endTime}:00`;

    const request = {
      idprofessional,
      day: baseDate,
      start_hour,
      end_hour,
      available: true
    };

    try {
      await this.availabilityService.createAvailability(request).toPromise();
      this.toastService.show('Disponibilidad guardada correctamente', 'Éxito', 'success');
    } catch (err) {
      this.toastService.show('Error al guardar disponibilidad individual', 'Error', 'error');
      console.error('Error individual:', err);
    }

    // Si el usuario marcó patrón semanal
    if (this.showPatternOptions) {
      const patternRequest = {
        idprofessional,
        start_hour,
        end_hour,
        pattern_start_date: this.patternStartDate.split('T')[0],
        pattern_end_date: this.patternEndDate.split('T')[0],
        repetition: 'WEEKLY',
        monday: this.selectedDays.includes('monday'),
        tuesday: this.selectedDays.includes('tuesday'),
        wednesday: this.selectedDays.includes('wednesday'),
        thursday: this.selectedDays.includes('thursday'),
        friday: this.selectedDays.includes('friday'),
        saturday: this.selectedDays.includes('saturday'),
        sunday: this.selectedDays.includes('sunday')
      };

      try {
        await this.availabilityService.createPattern(patternRequest).toPromise();
        this.toastService.show('Patrón de disponibilidad guardado', 'Éxito', 'success');
      } catch (err) {
        this.toastService.show('Error al guardar patrón de disponibilidad', 'danger');
        console.error('Error patrón:', err);
      }
    }
  }

  // ----- Método para guardar una excepción -----
  async saveException() {
    const user = await this.userService.getCurrentUser().toPromise();
    const idprofessional = user?.idprofessional;

    // Validaciones de excepción
    if (!idprofessional || !this.exceptionDate || !this.startTime || !this.endTime || !this.exceptionReason) {
      this.toastService.show('Completa todos los campos de la excepción', 'Aviso', 'warning');
      return;
    }
    const request = {
      idprofessional,
      day: this.exceptionDate.split('T')[0],
      start_hour: `${this.startTime}:00`,
      end_hour: `${this.endTime}:00`,
      reason: this.exceptionReason
    };
    try {
      await this.availabilityService.createException(request).toPromise();
      this.toastService.show('Excepción guardada correctamente', 'Éxito', 'success');
    } catch (err) {
      this.toastService.show('Error al guardar excepción', 'Error', 'error');
      console.error('Error excepción:', err);
    }
  }

  // ----- Handler único de guardado -----
  async handleSave() {
    this.loading = true;  // Activa spinner
    try {
      if (this.showAvailabilityForm) {
        await this.saveAvailability(); // Guarda disponibilidad
      } else {
        await this.saveException(); // Guarda patrón de días disponibles
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      this.toastService.show('Hubo un error al guardar.', 'Error', 'error');
    } finally {
      this.loading = false;                        // Detiene spinner
      await this.modalCtrl.dismiss({ refresh: true });  // Cierra modal y notifica refresh; se guarda disponiblidad de manera exitosa
    }
  }

  // Cierra modal desde header
  dismiss() {
    this.modalCtrl.dismiss();
  }
}
