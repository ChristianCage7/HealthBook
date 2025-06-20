import { Component, OnInit } from '@angular/core';
import { format, isAfter } from 'date-fns';
import { Appointment, AppointmentService } from 'src/app/shared/services/appointment.service';
import { CreditorService, Professional } from 'src/app/shared/services/creditor.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  firstName = '';
  imgprofile = 'assets/icon/profile-img.png';
  hasAppointments = false;
  nextAppointmentText = '';
  nextAppointmentStatus = '';
  nextProfessionalName = '';
  showWelcomeCard = true;
  showAnimation = false;
  allProfessionals: Professional[] = [];

  constructor(
    private userService: UserService,
    private appointmentService: AppointmentService,
    private creditorService: CreditorService
  ) { }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(user => {
      this.firstName = user.first_name.split(' ')[0];
      if (user.imgprofile) {
        this.imgprofile = user.imgprofile;
      }

      this.creditorService.getAllProfessionals().subscribe(professionals => {
        this.allProfessionals = professionals;

        this.appointmentService.getUserAppointments(user.id).subscribe((appointments: Appointment[]) => {
          const now = new Date();

          const future = appointments
            .filter(a => isAfter(new Date(`${a.appointmentDate}T${a.appointmentTime}`), now))
            .sort((a, b) =>
              new Date(`${a.appointmentDate}T${a.appointmentTime}`).getTime() -
              new Date(`${b.appointmentDate}T${b.appointmentTime}`).getTime()
            );

          if (future.length > 0) {
            const next = future[0];
            const dateTime = new Date(`${next.appointmentDate}T${next.appointmentTime}`);

            this.nextAppointmentText = `${format(dateTime, 'EEEE, d MMMM')} – ${format(dateTime, 'HH:mm')} hrs`;
            this.nextAppointmentStatus = this.translateStatus(next.status);
            this.hasAppointments = true;

            const professional = this.allProfessionals.find(p => p.idprofessional === next.idprofessional);
            this.nextProfessionalName = professional
              ? `${professional.first_name} ${professional.last_name}`
              : 'Profesional desconocido';
          } else {
            this.hasAppointments = false;
          }
        });
      });
    });
  }

  private translateStatus(status: number): string {
    switch (status) {
      case 0: return 'Pendiente';
      case 1: return 'Confirmada';
      case 2: return 'Rechazada';
      case 3: return 'Cancelada';
      case 4: return 'Completada';
      default: return 'Desconocido';
    }
  }
}