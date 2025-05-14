import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { CreditorService } from 'src/app/shared/services/creditor.service';

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
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loadPendingProfessionals();
  }

  loadPendingProfessionals() {
    this.creditorService.getPendingProfessionals().subscribe((data: any[]) => {
      this.professionals = data;
    })
  }

  approve(idProfessional: number) {
    this.creditorService.approveProfessional(idProfessional).subscribe(async () => {
      this.professionals = this.professionals.filter(p => p.idprofessional !== idProfessional);
      const alert = await this.alertController.create({
        header: 'Éxito',
        message: 'Profesional aprobado.',
        buttons: ['OK']
      });
      await alert.present();
    });
  }

  async reject(idProfessional: number) {
    this.professionals = this.professionals.filter(p => p.idprofessional !== idProfessional);
    const alert = await this.alertController.create({
      header: 'Rechazado',
      message: 'Profesional rechazado',
      buttons: ['OK']
    });
    await alert.present();
  }
}
