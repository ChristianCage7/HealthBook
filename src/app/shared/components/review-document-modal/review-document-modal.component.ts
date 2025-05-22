import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
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

  constructor(
    private modalCtrl: ModalController,
    private creditorService: CreditorService
  ) { }

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.creditorService.getDocumentsByProfessional(this.professional.idprofessional).subscribe(docs => {
      this.documents = docs;
    });
  }

  download(iduserdocument: number) {
    const url = `http://localhost:8080/api/documents/download/${iduserdocument}`;
    window.open(url, '_blank');
  }


  close(action: 'approve' | 'reject') {
    this.modalCtrl.dismiss({
      action,
      comment: this.comment
    });
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}
