import { Component, OnInit } from '@angular/core';
import { CreditorService } from 'src/app/shared/services/creditor.service';
import { ToastService } from 'src/app/shared/services/toast.service';

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
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadProfessionals();
  }

  loadProfessionals() {
    this.loading = true;
    this.creditorService.getAllProfessionals().subscribe(data => {
      this.users = data;
      this.loading = false;
      this.toastService.show('Profesionales cargados correctamente', 'Éxito', 'success');
    });
  }

  loadUserBasics() {
    this.loading = true;
    this.creditorService.getAllUsers().subscribe(data => {
      this.users = data;
      this.loading = false;
      this.toastService.show('Usuarios básicos cargados correctamente', 'Éxito', 'success');
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
