import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CallService } from 'src/app/shared/services/call.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-professional-sessions',
  templateUrl: './professional-sessions.page.html',
  styleUrls: ['./professional-sessions.page.scss'],
  standalone: false
})
export class ProfessionalSessionsPage implements OnInit {
  appointments: any[] = [];

  constructor(
    private router: Router,
    private userService: UserService,
    private callService: CallService
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  goToManageAvailability() {
    this.router.navigate(['/menu/manage-availability']);
  }

  async loadAppointments() {
    try {
      const uid = await this.userService.getUidFromAuth();
      const user = await this.userService.getCurrentUser().toPromise();

      if (!user?.id || user?.idprofile !== 2) {
        console.warn('No es profesional o falta ID');
        return;
      }

      this.callService.getAppointmentsByProfessional(user.id).subscribe(apps => {
        this.appointments = apps.filter(app => app.status === 1);
      });
    } catch (err) {
      console.error('Error al cargar citas del profesional:', err);
    }
  }

  iniciarLlamada(cita: any) {
    this.router.navigate(['/call-professional'], {
      state: {
        token: cita.tokenProfessional,
        sessionId: cita.sessionId
      }
    });
  }
}