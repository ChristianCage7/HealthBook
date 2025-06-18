import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { AppointmentService, Appointment } from 'src/app/shared/services/appointment.service';
import { UserService } from 'src/app/shared/services/user.service';
import { AppointmentHistoryComponent } from './appointment-history/appointment-history.component';

interface UserGroup {
  userProfile: any;
  appointments: Appointment[];
  expanded: boolean;
}

@Component({
  selector: 'app-medical-history',
  templateUrl: './medical-history.page.html',
  styleUrls: ['./medical-history.page.scss'],
  standalone: false
})
export class MedicalHistoryPage implements OnInit {
  users: UserGroup[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private userService: UserService,
    private appointmentService: AppointmentService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  private loadHistory() {
    this.loading = true;
    this.error = null;

    this.userService.getCurrentUser().pipe(
      switchMap(user =>
        this.appointmentService.getProfessionalAppointments(user.idprofessional!)
      ),
      switchMap(appts => {
        if (!appts.length) return of([]);
        const calls = appts.map(appt =>
          this.appointmentService
            .getUserBasicProfileByAppointment(appt.idappointment)
            .pipe(
              map(profile => ({ appt, profile })),
              catchError(() => of({ appt, profile: null }))
            )
        );
        return forkJoin(calls);
      })
    ).subscribe({
      next: results => {
        const map = new Map<number, UserGroup>();
        results.forEach(r => {
          if (!r.profile) return;
          const id = r.profile.iduser;
          if (!map.has(id)) {
            map.set(id, {
              userProfile: r.profile,
              appointments: [],
              expanded: false
            });
          }
          map.get(id)!.appointments.push(r.appt);
        });
        this.users = Array.from(map.values());
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar el historial.';
        this.loading = false;
      }
    });
  }

  toggle(group: UserGroup) {
    group.expanded = !group.expanded;
  }

  async openModal(group: UserGroup) {
    const modal = await this.modalCtrl.create({
      component: AppointmentHistoryComponent,
      componentProps: {
        userProfile: group.userProfile,
        appointments: group.appointments
      }
    });
    await modal.present();
  }
}