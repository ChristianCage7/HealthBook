import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertController, NavController } from '@ionic/angular';
import { supabase } from 'src/app/shared/services/supabase.client';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit {

  user: any = {};
  editForm!: FormGroup;
  professions: any[] = [];

  editMode = false;

  selectedImage: File | null = null;
  selectedImagePreview: string | null = null;

  constructor(
    private userService: UserService,
    private alertCtrl: AlertController,
    private fb: FormBuilder,
    private navCtrl: NavController,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    await this.loadUser();
  }

  async loadUser() {
    this.userService.getCurrentUser().subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response[0] : response;
        this.user = data;
        this.user.email = data.Register?.email || '';
        this.user.UID = data.UID;

        this.editForm = this.fb.group({
          first_name: [data.first_name, Validators.required],
          last_name: [data.last_name, Validators.required]
        });
      },
      error: async () => {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo cargar la información del perfil.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  getEditControl(controlName: string): FormControl {
    return this.editForm.get(controlName) as FormControl;
  }

  async saveEdit() {
    if (this.editForm.invalid) return;

    const updatedUser = {
      UID: this.user.UID,
      idprofessional: this.user.idprofessional,
      firstName: this.editForm.value.first_name,
      lastName: this.editForm.value.last_name,
      email: this.user.email
    };

    this.userService.updateUser(updatedUser).subscribe({
      next: async () => {
        const alert = await this.alertCtrl.create({
          header: 'Éxito',
          message: 'Perfil actualizado correctamente',
          buttons: ['OK']
        });
        await alert.present();
        this.editMode = false;
        await this.loadUser();
      },
      error: async () => {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo actualizar el perfil.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedImage = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadProfileImage() {
    if (!this.selectedImage || !this.user.UID) return;

    const formData = new FormData();
    formData.append('uid', this.user.UID);
    formData.append('file', this.selectedImage);

    this.userService.uploadProfileImage(formData).subscribe({
      next: async () => {
        const alert = await this.alertCtrl.create({
          header: 'Éxito',
          message: 'Imagen de perfil actualizada',
          buttons: ['OK']
        });
        await alert.present();
        this.selectedImage = null;
        this.selectedImagePreview = null;
        await this.loadUser();
      },
      error: async () => {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'No se pudo actualizar la imagen.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  async confirmChangePassword() {
    const alert = await this.alertCtrl.create({
      header: 'Cambiar contraseña',
      message: 'Se enviará un correo a tu dirección actual para cambiar la contraseña. ¿Deseas continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar correo',
          handler: () => this.sendPasswordRecovery()
        }
      ]
    });
    await alert.present();
  }

  sendPasswordRecovery() {
    this.userService.sendPasswordRecovery(this.user.email).subscribe(async () => {
      const alert = await this.alertCtrl.create({
        header: 'Correo enviado',
        message: 'Revisa tu correo para cambiar la contraseña.',
        buttons: ['OK']
      });
      await alert.present();
    });
  }

  async confirmDeleteAccount() {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => this.deleteAndLogout()
        }
      ]
    });
    await alert.present();
  }

  private async deleteAndLogout() {
    try {
      const uid = await this.userService.getUidFromAuth();
      const apiUrl = this.userService['apiUrl'];
      await this.http.delete(`${apiUrl}/api/register/delete/${uid}`, { responseType: 'text' }).toPromise();

      await supabase.auth.signOut();
      this.navCtrl.navigateRoot('/auth'); // Redirige correctamente a tu login
    } catch (e) {
      const errAlert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No se pudo eliminar la cuenta.',
        buttons: ['OK']
      });
      await errAlert.present();
    }
  }

  //Swipe para refrescar
  async handleRefresh(event: CustomEvent) {
    try {
      await this.loadUser(); // 🔄 recarga toda la información del usuario
    } catch (e) {
      console.error('❌ Error al refrescar perfil:', e);
    } finally {
      (event.target as HTMLIonRefresherElement)?.complete(); // ✅ detener el spinner
    }
  }

}