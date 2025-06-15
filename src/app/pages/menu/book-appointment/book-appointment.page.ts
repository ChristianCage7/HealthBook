
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { ProfessionalProfileModalComponent } from 'src/app/shared/components/professional-profile-modal/professional-profile-modal.component';
import { CreditorService } from 'src/app/shared/services/creditor.service';
import { EvaluationService } from 'src/app/shared/services/evaluation.service';
import { UserService } from 'src/app/shared/services/user.service';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-book-appointment',
  templateUrl: './book-appointment.page.html',
  styleUrls: ['./book-appointment.page.scss'],
  standalone: false,
})
export class BookAppointmentPage implements OnInit {

  professionals: any[] = [];
  iduser: number | null = null;
  searchText: string = '';
  filterOption: 'none' | 'high' | 'low' = 'none';
  allProfessionals: any[] = [];
  genderFilter: string = 'Todos';
  filteredProfessionals: any[] = [];


  constructor(
    private creditorService: CreditorService,
    private modalController: ModalController,
    private router: Router,
    private userService: UserService,
    private evaluationService: EvaluationService,
    private popoverController: PopoverController
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
    }).pipe(
      switchMap(({ professionals, genders }) => {
        const approved = professionals.filter(p => p.approve === 1).map(pro => ({
          ...pro,
          genderName: genders.find(g => g.idgender === pro.gender)?.gender || 'Desconocido'
        }));

        const professionalsWithRatings$ = approved.map(pro =>
          this.evaluationService.getAverageRating(pro.idprofessional).pipe(
            map((res) => {
              const avg = Array.isArray(res) && res.length > 0 ? Number(res[0].avg_score ?? 0) : 0;
              return { ...pro, averageRating: avg };
            }),
            catchError(() => of({ ...pro, averageRating: 0 }))
          )
        );

        return forkJoin(professionalsWithRatings$);
      })
    ).subscribe({
      next: (result) => {
        this.allProfessionals = result;
        console.log('Profesionales cargados con ratings:', result);
        this.applyFilters(); // Aplica búsqueda y filtro al inicio
      },
      error: (err) => {
        console.error('Error cargando profesionales con rating:', err);
      }
    });
  }

  applyFilters() {
    this.filteredProfessionals = this.allProfessionals
      .filter(p => {
        const nameMatch = `${p.first_name} ${p.last_name}`.toLowerCase().includes(this.searchText.toLowerCase());
        const genderMatch = this.genderFilter === 'Todos' || p.genderName === this.genderFilter;
        return nameMatch && genderMatch;
      })
      .sort((a, b) => {
        if (this.filterOption === 'high') return (b.averageRating ?? 0) - (a.averageRating ?? 0);
        if (this.filterOption === 'low') return (a.averageRating ?? 0) - (b.averageRating ?? 0);
        return 0;
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
    this.router.navigate(['/book-appointment/new-appointment', prof.idprofessional],
      { state: { professional: prof } }
    );
  }

  //Filtro

  setFilter(option: 'none' | 'high' | 'low') {
    this.filterOption = option;

    if (option === 'none') {
      this.searchText = '';
      this.genderFilter = 'Todos';
    }

    this.applyFilters();
    this.popoverController.dismiss();
  }

  //Filtro de género
  setGenderFilter(gender: string) {
    this.genderFilter = gender;
    this.applyFilters();
    this.popoverController.dismiss();
  }

  clearSearch() {
    this.searchText = '';
    this.applyFilters();
  }

  //Filtro activo
  hasActiveFilters(): boolean {
  return (
    this.filterOption !== 'none' ||
    this.genderFilter !== 'Todos' ||
    this.searchText.trim() !== ''
  );
}

}