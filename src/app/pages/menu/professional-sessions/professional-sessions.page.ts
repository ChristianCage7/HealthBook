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

  constructor(
    private router: Router,
    private userService: UserService,
    private callService: CallService
  ) {}

  ngOnInit() {}

  goToManageAvailability() {
    this.router.navigate(['/menu/manage-availability']);
  }

 iniciarCitaDesdeBase() {
  this.userService.getCurrentUser().subscribe(user => {
    console.log('[🟣] Usuario actual:', user);

    const idProfessional = user.idprofessional;

    if (!idProfessional || user.idprofile !== 2) {
      console.warn('[⚠️] No es profesional o falta ID');
      return;
    }

    this.callService.getAppointmentsByProfessional(idProfessional).subscribe(citas => {
      console.log('[📦] Citas encontradas:', citas);

      const activas = citas.filter(c => c.status === 1 && c.tokenProfessional);

      if (activas.length === 0) {
        alert('No tienes citas activas para iniciar.');
        console.warn('[🛑] No hay citas activas o falta tokenProfessional');
        return;
      }

      const cita = activas[0];
      console.log('[✅] Redirigiendo a videollamada con:', cita.sessionId, cita.tokenProfessional);

      this.router.navigate(['/call-professional'], {
        state: {
          sessionId: cita.sessionId,
          token: cita.tokenProfessional
        }
      });
    }, error => {
      console.error('[❌] Error al obtener citas:', error);
    });
  }, error => {
    console.error('[❌] Error al obtener usuario:', error);
  });
}

}
