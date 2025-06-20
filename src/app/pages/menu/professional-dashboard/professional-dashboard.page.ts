import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';
import { AppointmentService } from 'src/app/shared/services/appointment.service';
import { isSameDay, isAfter, format } from 'date-fns';

@Component({
  selector: 'app-professional-dashboard',
  templateUrl: './professional-dashboard.page.html',
  styleUrls: ['./professional-dashboard.page.scss'],
  standalone: false
})
export class ProfessionalDashboardPage implements OnInit {

  // ─── Estado para animación inicial ───────────────────────
  showAnimation = false;

  // ─── Datos del profesional ───────────────────────────────
  firstName: string = '';        
  avatarUrl: string = 'assets/icon/profile-img.png'; 

  // ─── Resumen de citas ────────────────────────────────────
  totalAppointmentsText: string = '';    // ahora string con mensaje
  nextAppointmentText: string = '';      // texto para próxima cita o fallback

  constructor(
    private router: Router,
    private userService: UserService,
    private appointmentService: AppointmentService
  ) { }

  ngOnInit() {
    // ─── Animación de bienvenida ───────────────────────────
    const alreadyAnimated = localStorage.getItem('welcome_animated');
    if (!alreadyAnimated) {
      this.showAnimation = true;
      localStorage.setItem('welcome_animated', 'true');
    }

    // ─── Carga datos del usuario y citas ───────────────────
    this.loadProfessional();   // trae nombre + avatar
    this.loadAppointments();   // calcula total y próxima cita
  }

  // Navegación a "Manejar disponibilidad de profesional"
  goToManageAvailability() {
    this.router.navigate(['/menu/manage-availability']);
  }

  // Navegación a "Historial clínico paciente"
  goToMedicalHistory() {
    this.router.navigate(['/menu/professional-dashboard/medical-history']);
  }

  
  // ─── Trae primer nombre y avatar del profesional ────────
  private loadProfessional() {
    this.userService.getCurrentUser().subscribe(user => {
      if (!user) { return; }
      this.firstName = user.first_name.split(' ')[0];
      if (user.imgprofile) {
        this.avatarUrl = user.imgprofile;
      }
    });
  }

  // ─── Trae todas las citas del día, cuenta Texto y próxima cita ───
  private loadAppointments() {
    this.userService.getCurrentUser().subscribe(user => {
      const idp = user?.idprofessional;
      if (!idp) {
        // sin profesional no hay citas
        this.totalAppointmentsText = ' No hay citas agendadas';
        this.nextAppointmentText  = ' No tiene citas agendadas';
        return;
      }

      this.appointmentService.getUserAppointments(idp).subscribe(appts => {
        const now = new Date();
        // sólo las de hoy
        const todays = appts.filter(a => {
          const dt = new Date(a.appointmentDate);
          return isSameDay(dt, now);
        });

        // total con texto
        if (todays.length > 0) {
          this.totalAppointmentsText = ` ${todays.length} agendadas`;
        } else {
          this.totalAppointmentsText = ' No hay citas agendadas';
        }

        // próxima FUTURA de hoy
        const futureToday = todays
          .map(a => ({ ...a, dt: new Date(a.appointmentDate) }))
          .filter(a => isAfter(a.dt, now))
          .sort((a, b) => a.dt.getTime() - b.dt.getTime());

        if (futureToday.length > 0) {
          const next = futureToday[0].dt;
          this.nextAppointmentText =
            `${format(next, 'EEEE, d MMMM')} – ${format(next, 'HH:mm')} hrs`;
        } else {
          this.nextAppointmentText = ' No tiene citas agendadas';
        }
      });
    });
  }
}
