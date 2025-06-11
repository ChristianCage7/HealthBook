import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CreditorService } from 'src/app/shared/services/creditor.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { UserService } from 'src/app/shared/services/user.service';
import { AlertController, ModalController } from '@ionic/angular';
import { CreditorProfileEditModalComponent } from 'src/app/shared/components/creditor-profile-edit-modal/creditor-profile-edit-modal.component';
import { HttpClient } from '@angular/common/http';


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
  deleteWrapper = false;

  constructor(
    private creditorService: CreditorService,
    private toastService: ToastService,
    private userService: UserService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.loadProfessionals();
  }

  /*Obtener profesionales*/
  loadProfessionals() {
    this.loading = true;

    forkJoin({
      users: this.creditorService.getAllProfessionals(),
      genders: this.userService.getGenders()
    }).subscribe({
      next: ({ users, genders }) => {
        // Solo incluir usuarios con status = 1 o activos
        this.users = users
          .filter(user => user.Register?.status === 1)
          .map(user => ({
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

  /*Obtener usuarios básicos */
  loadUserBasics() {
    this.loading = true;

    forkJoin({
      users: this.creditorService.getAllUsers(),
      genders: this.userService.getGenders()
    }).subscribe({
      next: ({ users, genders }) => {
        // Solo incluir usuarios con status = 1 o activos
        this.users = users
          .filter(user => user.Register?.status === 1)
          .map(user => ({
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

  //Abre modal para editar usuario
  async openEditModal(user: any) {
    const modal = await this.modalCtrl.create({
      component: CreditorProfileEditModalComponent,
      componentProps: {
        userData: user
      },
    });

    await modal.present();
  }

  //Eliminar usuario
  async confirmDeleteAccount(user: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar la cuenta de ${user.first_name} ${user.last_name}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.delete(user.UID)
        }
      ]
    });
    await alert.present();
  }

  //Función para eliminar usuario
  private async delete(uid: string) {
    try {
      const apiUrl = this.userService['apiUrl'];
      const url = `${apiUrl}/api/register/delete/${uid}`;

      await this.http.delete(url, { responseType: 'text' }).toPromise();

      const successAlert = await this.alertCtrl.create({
        header: 'Cuenta eliminada',
        message: 'La cuenta fue eliminada correctamente.',
        buttons: ['OK']
      });
      await successAlert.present();

      // Refrescar vista actual
      this.changeView(this.viewType);

    } catch (e) {
      console.error('Error al eliminar el usuario:', e);

      const errAlert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo eliminar la cuenta.',
        buttons: ['OK']
      });
      await errAlert.present();
    }
  }

  /*Cambiar vista entre profesionales y básicos*/
  changeView(type: 'professionals' | 'basics') {
    this.viewType = type;
    if (type === 'professionals') {
      this.loadProfessionals();
    } else {
      this.loadUserBasics();
    }
  }
}
