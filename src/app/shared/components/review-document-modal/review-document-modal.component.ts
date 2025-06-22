import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { CreditorService } from 'src/app/shared/services/creditor.service';
import { UserService } from '../../services/user.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ToastService } from '../../services/toast.service';

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
  idCreditor: number | null = null;
  private apiUrl = environment.apiUrl;

  constructor(
    private modalCtrl: ModalController,
    private creditorService: CreditorService,
    private alertCtrl: AlertController,
    private toastService: ToastService,
    private userService: UserService,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.userService.getUidFromAuth()
      .then(uid => {
        return this.http.get<any[]>(`${this.apiUrl}/users/creditor/${uid}`).toPromise();
      })
      .then(res => {
        if (res && res.length > 0) {
          this.idCreditor = res[0].idcreditor;
          console.log('Acreditador cargado:', this.idCreditor);
        } else {
          console.warn('No se encontró acreditador para este UID');
        }
      })
      .catch(err => {
        console.error('Error al obtener acreditador:', err);
      });

    this.loadDocuments();
  }

  loadDocuments() {
    this.creditorService.getDocumentsByProfessional(this.professional.idprofessional).subscribe(
      docs => {
        if (Array.isArray(docs)) {
          this.documents = docs;
        } else {
          console.warn('Respuesta inesperada al cargar documentos:', docs);
          this.documents = [];
        }
      },
      err => {
        console.error('Error al cargar documentos:', err);
        this.documents = [];
      }
    );
  }


  download(docId: number) {
    const url = `${this.apiUrl}/documents/download/${docId}`;
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
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: async () => {
            if (!this.selectedAction || this.idCreditor === null) {
              console.warn('Acción o idCreditor no definido. Abortando.');
              return;
            }

            if (this.documents.length === 0) {
              this.toastService.show('No hay documentos para evaluar.', 'Aviso', 'warning');
              return;
            }

            console.log(`Iniciando proceso de ${this.selectedAction} para documentos del profesional ID ${this.professional.idprofessional}`);

            const promises = this.documents.map(doc => {
              if (this.selectedAction === 'approve') {
                return this.creditorService.approveDocument(doc.iduserdocument, this.idCreditor!, this.comment).toPromise();
              } else {
                return this.creditorService.rejectDocument(doc.iduserdocument, this.idCreditor!, this.comment).toPromise();
              }
            });

            try {
              await Promise.all(promises);
              this.toastService.show('Evaluación completada exitosamente.', 'Éxito', 'success');
              this.modalCtrl.dismiss({
                action: this.selectedAction,
                comment: this.comment
              });
            } catch (error) {
              console.error('Error en la evaluación:', error);
              this.toastService.show('Error al completar la evaluación. Intente nuevamente.', 'Error', 'error');
            }
          }
        }
      ]
    });

    await alert.present();
  }


}
