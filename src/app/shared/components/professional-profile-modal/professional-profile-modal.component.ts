import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-professional-profile-modal',
  templateUrl: './professional-profile-modal.component.html',
  styleUrls: ['./professional-profile-modal.component.scss'],
  standalone: false


})
export class ProfessionalProfileModalComponent implements OnInit {
  @Input() professional: any;

  constructor(
    private modalCtrl: ModalController,
    private router: Router
  ) { }

  ngOnInit() { }

  cancel() {
    this.modalCtrl.dismiss();
  }

  //Ruta para ir a página para agendar
  goToNewAppointment(){
    console.log('Navegando a:', this.professional.idprofessional);
    this.router.navigate(['/book-appointment/new-appointment', this.professional.idprofessional]);
    this.modalCtrl.dismiss();
  }

}
