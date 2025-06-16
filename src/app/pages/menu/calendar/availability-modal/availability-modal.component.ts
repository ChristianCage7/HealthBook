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


  // 🔹 NUEVOS campos para excepciones
  exceptionDate: string = '';
  exceptionReason: string = '';

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
    this.generateTimeBlocks();

    if (this.preselectedDate) {
      const base = new Date(this.preselectedDate);
      base.setHours(0, 0, 0, 0);
      const iso = base.toISOString();

      this.patternStartDate = iso;
      this.patternEndDate = iso;
      this.exceptionDate = iso; // importante para mostrar
    }
  }


  generateTimeBlocks() {
    const blocks: string[] = [];
    for (let hour = 8; hour <= 20; hour++) {
      blocks.push(`${this.pad(hour)}:00`);
      if (hour < 20) blocks.push(`${this.pad(hour)}:30`);
    }
    this.timeBlocks = blocks;
  }

  pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  onStartTimeSelect(time: string) {
    this.startTime = time;

    const [h, m] = time.split(':').map(Number);
    const start = new Date();
    start.setHours(h, m, 0, 0);
    start.setMinutes(start.getMinutes() + 30);

    const hh = this.pad(start.getHours());
    const mm = this.pad(start.getMinutes());
    this.endTime = `${hh}:${mm}`;
  }

  togglePatternOptions(checked: boolean) {
    this.showPatternOptions = checked;
  }

  async saveAvailability() {
    const user = await this.userService.getCurrentUser().toPromise();
    const idprofessional = user?.idprofessional;

    if (!idprofessional || !this.startTime || !this.endTime || !this.preselectedDate) {
      this.toastService.show('Debes completar todos los campos obligatorios', 'danger');
      return;
    }

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
        this.toastService.show('Patrón de disponibilidad guardado', 'success');
      } catch (err) {
        this.toastService.show('Error al guardar patrón de disponibilidad', 'danger');
        console.error('Error patrón:', err);
      }
    }

  }

  //  Método para guardar excepción
  async saveException() {
    const user = await this.userService.getCurrentUser().toPromise();
    const idprofessional = user?.idprofessional;

    if (!idprofessional || !this.exceptionDate || !this.startTime || !this.endTime || !this.exceptionReason) {
      this.toastService.show('⛔ Completa todos los campos de la excepción', 'danger');
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
      this.toastService.show('Excepción guardada correctamente', 'success');
      this.dismiss(true);
    } catch (err) {
      this.toastService.show('Error al guardar excepción', 'danger');
      console.error('Error excepción:', err);
    }
  }

  dismiss(refresh: boolean = false) {
    this.modalCtrl.dismiss({ refresh });
  }

  async handleSave() {
    this.loading = true;

    try {
      if (this.showAvailabilityForm) {
        await this.saveAvailability();
      } else {
        await this.saveException();
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      this.toastService.show('Hubo un error al guardar.', 'danger');
    } finally {
      this.loading = false;
    }
  }

}
