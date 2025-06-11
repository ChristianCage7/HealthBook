import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { ProfessionalProfileModalComponent } from 'src/app/shared/components/professional-profile-modal/professional-profile-modal.component';
import { CreditorService } from 'src/app/shared/services/creditor.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-book-appointment',
  templateUrl: './book-appointment.page.html',
  styleUrls: ['./book-appointment.page.scss'],
  standalone: false,
})
export class BookAppointmentPage implements OnInit {

  professionals: any[] = [];
  iduser: number | null = null;

  constructor(
    private creditorService: CreditorService,
    private modalController: ModalController,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loadProfessionals();

    // Obtener ID del usuario autenticado
    this.userService.getCurrentUser().subscribe({
      next: user => {
        this.iduser = user.id;
        console.log('ID de usuario autenticado:', this.iduser);
      },
      error: err => {
        console.error('Error obteniendo usuario:', err);
      }
    });
  }

  /*Obtiene profesionales*/
  loadPendingProfessionals() {
    this.creditorService.getAllProfessionals().subscribe((data: any[]) => {
      // Filtrar por profesionales aprobados en frontend
      this.professionals = data.filter(p => p.approve === 1);
    });
  }

  /*Obtener profesionales*/
  loadProfessionals() {
    forkJoin({
      professionals: this.creditorService.getAllProfessionals(),
      genders: this.userService.getGenders()
    }).subscribe({
      next: ({ professionals, genders }) => {
        // Mapea con los nombres de género 
        this.professionals = professionals
          .map(pro => ({
            ...pro,
            genderName: genders.find(g => g.idgender === pro.gender)?.gender || 'Desconocido'
          }))
          .filter(pro => pro.approve === 1); // y luego se filtran solo profesionales aprobados
      },
      error: (err) => {
        console.error('Error cargando profesionales:', err);
      }
    });
  }

  /*Abre modal de perfil profesional*/
  async openProfessionalProfileModal(professional: any) {
    try {
      const modal = await this.modalController.create({
        component: ProfessionalProfileModalComponent,
        componentProps: {
          professional,
          iduser: this.iduser  // ← Se pasa el id del usuario autenticado
        }
      });

      await modal.present();

      const { data } = await modal.onWillDismiss();
    } catch (error) {
      console.error('Error abriendo modal de perfil profesional:', error);
    }
  }

  //Ruta para ir a página para agendar
  goToNewAppointment(event: Event, prof: any) {
    event.stopPropagation();
    console.log('Navegando a:', prof.idprofessional);
    this.router.navigate(['/book-appointment/new-appointment', prof.idprofessional]);
  }

}
