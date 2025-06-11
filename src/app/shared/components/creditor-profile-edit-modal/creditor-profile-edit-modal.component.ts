import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-creditor-profile-edit-modal',
  templateUrl: './creditor-profile-edit-modal.component.html',
  styleUrls: ['./creditor-profile-edit-modal.component.scss'],
  standalone: false
})
export class CreditorProfileEditModalComponent implements OnInit {
  @Input() userData: any;

  editForm!: FormGroup;
  user: any = {};
  selectedImage: File | null = null;
  selectedImagePreview: string | null = null;
  editMode = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    
    if (this.userData) {
      this.user = this.userData;
      this.user.email = this.userData.Register?.email || this.userData.email || '';
      this.user.UID = this.userData.UID || this.userData.uid || '';

      this.editForm = this.fb.group({
        first_name: [this.user.first_name, Validators.required],
        last_name: [this.user.last_name, Validators.required]
      });
    }
  }

  getEditControl(control: string): FormControl {
    return this.editForm.get(control) as FormControl;
  }

  //Guarda la edición de usuario, hace update a la tabla
  async saveEdit() {
    if (this.editForm.invalid) return;

    const updatedUser = {
      UID: this.user.UID,
      idprofessional: this.user.idprofessional,
      iduser: this.user.iduser,
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
      }
    });
  }

  //Cambia imagen perfil
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

  //Sube foto de perfil a s3
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
      }
    });
  }

  //Cambio de contraseña
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

  //Envia recuperación de password
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

  cancel(){
    this.modalCtrl.dismiss();
  }
}
