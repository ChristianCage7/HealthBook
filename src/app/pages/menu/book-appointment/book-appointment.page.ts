import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ProfessionalProfileModalComponent } from 'src/app/shared/components/professional-profile-modal/professional-profile-modal.component';
import { CreditorService } from 'src/app/shared/services/creditor.service';

@Component({
  selector: 'app-book-appointment',
  templateUrl: './book-appointment.page.html',
  styleUrls: ['./book-appointment.page.scss'],
  standalone: false,
})
export class BookAppointmentPage implements OnInit {

  professionals: any[] = [];

  constructor(
    private creditorService: CreditorService,
    private modalController: ModalController,
    private router: Router,

  ) { }

  ngOnInit() {
    this.loadPendingProfessionals();
  }

  /*Obtiene profesionales*/
  loadPendingProfessionals() {
    this.creditorService.getAllProfessionals().subscribe((data: any[]) => {
      // Filtrar por profesionales abrobados en frontend
      this.professionals = data.filter(p => p.approve === 1);
    });
  }

  /*Abre modal de perfil profesional*/
  async openProfessionalProfileModal(professional: any) {
    const modal = await this.modalController.create({
      component: ProfessionalProfileModalComponent,
      componentProps: { professional }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

  }

  //Ruta para ir a página para agendar
  goToNewAppointment(event: Event, prof: any) {
    event.stopPropagation();
    console.log('Navegando a:', prof.idprofessional);
    this.router.navigate(['/book-appointment/new-appointment', prof.idprofessional]);
  }

}
