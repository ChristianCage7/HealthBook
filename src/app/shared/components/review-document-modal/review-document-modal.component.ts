import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { CreditorService } from 'src/app/shared/services/creditor.service';

@Component({
  selector: 'app-review-document-modal',
  templateUrl: './review-document-modal.component.html',
  styleUrls: ['./review-document-modal.component.scss'],
  standalone: false
})
export class ReviewDocumentModalComponent implements OnInit {
  @Input() professional: any;
  documents: any[] = [];
  comment: string = '';
  selectedAction: 'approve' | 'reject' | null = null;

  constructor(
    private modalCtrl: ModalController,
    private creditorService: CreditorService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.creditorService.getDocumentsByProfessional(this.professional.idprofessional).subscribe(docs => {
      this.documents = docs;
    });
  }

  download(docId: number) {
    const url = `http://localhost:8080/api/documents/download/${docId}`;
    window.open(url, '_blank');
  }

  close(action: 'approve' | 'reject') {
    this.selectedAction = action;
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  async confirmAction() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar evaluación',
      message: '¿Estás seguro de terminar la evaluación?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            // Mostramos toast antes de cerrar modal
            const toast = await this.toastCtrl.create({
              message: 'Evaluación completada exitosamente.',
              duration: 2000,
              color: 'success',
            });
            toast.present();

            // Cerramos modal después de que el toast desaparezca
            toast.onDidDismiss().then(() => {
              this.modalCtrl.dismiss({
                action: this.selectedAction,
                comment: this.comment
              });
            });
          }
        }
      ]
    });

    await alert.present();
  }

}
