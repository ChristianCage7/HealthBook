import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { CreditorService } from 'src/app/shared/services/creditor.service';
import { ReviewDocumentModalComponent } from 'src/app/shared/components/review-document-modal/review-document-modal.component';

@Component({
  selector: 'app-creditor',
  templateUrl: './creditor.page.html',
  styleUrls: ['./creditor.page.scss'],
  standalone: false
})
export class CreditorPage implements OnInit {

  professionals: any[] = [];

  constructor(
    private creditorService: CreditorService,
    private alertController: AlertController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.loadPendingProfessionals();
  }

  loadPendingProfessionals() {
    this.creditorService.getPendingProfessionals().subscribe((data: any[]) => {
      this.professionals = data;
    });
  }

  async openReviewModal(professional: any) {
    const modal = await this.modalController.create({
      component: ReviewDocumentModalComponent,
      componentProps: { professional }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data?.action) {
      if (data.action === 'approve') {
        this.creditorService.approveProfessional(professional.idprofessional).subscribe(async () => {
          this.professionals = this.professionals.filter(p => p.idprofessional !== professional.idprofessional);
          const alert = await this.alertController.create({
            header: 'Éxito',
            message: 'Profesional aprobado.',
            buttons: ['OK']
          });
          await alert.present();
        });
      } else if (data.action === 'reject') {
        // Aquí puedes agregar la llamada al backend para rechazar si existe
        this.professionals = this.professionals.filter(p => p.idprofessional !== professional.idprofessional);
        const alert = await this.alertController.create({
          header: 'Rechazado',
          message: 'Profesional rechazado.',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
  }

}
