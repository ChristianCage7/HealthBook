import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CreditorService } from 'src/app/shared/services/creditor.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-creditor-profile-edit',
  templateUrl: './creditor-profile-edit.page.html',
  styleUrls: ['./creditor-profile-edit.page.scss'],
  standalone: false
})
export class CreditorProfileEditPage implements OnInit {
  users: any[] = [];
  loading = false;
  viewType: 'professionals' | 'basics' = 'professionals';

  constructor(
    private creditorService: CreditorService,
    private toastService: ToastService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loadProfessionals();
  }

loadProfessionals() {
  this.loading = true;

  forkJoin({
    users: this.creditorService.getAllProfessionals(),
    genders: this.userService.getGenders()
  }).subscribe({
    next: ({ users, genders }) => {
      this.users = users.map(user => ({
        ...user,
        genderName: genders.find(g => g.idgender === user.gender)?.gender || 'Desconocido'
      }));

      this.loading = false;
      this.toastService.show('Profesionales cargados correctamente', 'Éxito', 'success');
    },
    error: (err) => {
      this.loading = false;
      this.toastService.show('Error cargando profesionales', 'Error', 'error');
      console.error(err);
    }
  });
}


  loadUserBasics() {
    this.loading = true;

    forkJoin({
      users: this.creditorService.getAllUsers(),
      genders: this.userService.getGenders()
    }).subscribe({
      next: ({ users, genders }) => {
        // Mapear usuarios para incluir el nombre del género
        this.users = users.map(user => ({
          ...user,
          genderName: genders.find(g => g.idgender === user.gender)?.gender || 'Desconocido'
        }));

        this.loading = false;
        this.toastService.show('Usuarios básicos cargados correctamente', 'Éxito', 'success');
      },
      error: (err) => {
        this.loading = false;
        this.toastService.show('Error cargando usuarios básicos', 'Error', 'error');
        console.error(err);
      }
    });
  }
  changeView(type: 'professionals' | 'basics') {
    this.viewType = type;
    if (type === 'professionals') {
      this.loadProfessionals();
    } else {
      this.loadUserBasics();
    }
  }
}
