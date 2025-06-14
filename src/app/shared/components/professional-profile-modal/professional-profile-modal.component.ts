import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { EvaluationService } from '../../services/evaluation.service';
import { faStar as faSolidStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-professional-profile-modal',
  templateUrl: './professional-profile-modal.component.html',
  styleUrls: ['./professional-profile-modal.component.scss'],
  standalone: false
})
export class ProfessionalProfileModalComponent implements OnInit {
  @Input() professional: any;
  @Input() iduser!: number;
  rating = 0;
  faSolidStar = faSolidStar;
  faHalfStar = faStarHalfAlt;
  faRegularStar = faRegularStar;
  stars: number[] = [0, 1, 2, 3, 4];
  comment: string = '';
  averageRating = 0;
  comments: any[] = [];

  constructor(
    private modalCtrl: ModalController,
    private router: Router,
    private evaluationService: EvaluationService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    if (this.professional?.idprofessional) {
      const id = this.professional.idprofessional;

      this.evaluationService.getAverageRating(id).subscribe({
        next: (res) => {
          if (Array.isArray(res) && res.length > 0) {
            this.averageRating = Number(res[0].avg_score ?? 0);
          } else {
            this.averageRating = 0;
          }
        },
        error: (err) => console.error('Error obteniendo promedio:', err)
      });
      
      this.evaluationService.getComments(id).subscribe({
        next: (comments) => {
          this.comments = comments;
          console.log('Comentarios:', comments);
        },
        error: (err) => console.error('Error obteniendo comentarios:', err)
      });
    }
  }

  setRating(value: number) {
    this.rating = value;
    console.log('Rating seleccionado:', value);
  }

  getStarIcon(index: number) {
    if (this.rating >= index) {
      return this.faSolidStar;
    } else if (this.rating >= index - 0.5) {
      return this.faHalfStar;
    } else {
      return this.faRegularStar;
    }
  }

  handleStarClick(event: MouseEvent, index: number) {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    const rating = clickX < rect.width / 2 ? index - 0.5 : index;
    this.rating = rating;
    console.log('Nuevo rating:', rating);
  }


  cancel() {
    this.modalCtrl.dismiss();
  }

  submitEvaluation() {
    if (!this.iduser || !this.professional?.idprofessional) {
      console.warn('Faltan datos para enviar evaluación');
      this.toastService.show('Faltan datos para enviar evaluación', 'Aviso', 'warning');
      return;
    }

    const idprofessional = this.professional.idprofessional;

    if (this.rating > 0) {
      this.evaluationService.rateProfessional(idprofessional, this.iduser, this.rating).subscribe({
        next: (res) => console.log('Rating enviado con éxito', res),
        error: (err) => console.error('Error al enviar rating:', err)
      });
    }

    if (this.comment.trim()) {
      this.evaluationService.commentProfessional(idprofessional, this.iduser, this.comment).subscribe({
        next: (res) => console.log('Comentario enviado con éxito', res),
        error: (err) => console.error('Error al enviar comentario:', err)
      });
    }
    this.toastService.show('Evaluación enviada con éxito', 'Éxito', 'success');
    this.comment = '';
    this.rating = 0;
    this.modalCtrl.dismiss();
  }

  goToNewAppointment() {
    this.router.navigate(['/book-appointment/new-appointment', this.professional.idprofessional]);
    this.modalCtrl.dismiss();
  }
}
