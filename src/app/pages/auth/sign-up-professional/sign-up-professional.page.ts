import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SupabaseService } from 'src/app/shared/services/supabase.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-sign-up-professional',
  standalone: false,
  templateUrl: './sign-up-professional.page.html',
  styleUrls: ['./sign-up-professional.page.scss'],
})
export class SignUpProfessionalPage implements OnInit {

  form!: FormGroup;
  selectedImage: File | null = null;
  selectedImageName: string = '';
  selectedDocument: File | null = null;
  selectedDocumentName: string = '';


  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private alertCtrl: AlertController,
    private http: HttpClient,
    private router: Router
  ) { 

    this.form = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      nationalId: new FormControl('', [Validators.required, Validators.minLength(6)]),
      datebirth: new FormControl('', [Validators.required]),
      idgender: new FormControl('', [Validators.required]),
      idprofession: new FormControl('', [Validators.required])
    }, {validators: this.passwordMatchValidator});

  }

  async ngOnInit() {
  }
  

  getFormControl(controlName: string): FormControl {
    return this.form.get(controlName) as FormControl;
  }

  passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }


  onDocumentSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file && file.type === 'application/pdf') {
      this.selectedDocument = file;
      this.selectedDocumentName = file.name;
    } else {
      this.showAlert('Solo se permite subir archivos PDF.');
      this.selectedDocument = null;
      this.selectedDocumentName = '';
    }
  }


  async submit() {
    if (this.form.invalid || !this.selectedDocument) {
      this.showAlert('Debe completar todos los campos y subir el documento PDF.');
      return;
    }

    const formData = this.form.value;

    const defaultImageBlob = await fetch('assets/icon/profile-img.png').then(res => res.blob());
    const defaultImageFile = new File([defaultImageBlob], 'profile-img.png', { type: 'image/png' });

    const formPayload = new FormData();
    formPayload.append('email', formData.email);
    formPayload.append('password', formData.password);
    formPayload.append('firstName', formData.firstName);
    formPayload.append('lastName', formData.lastName);
    formPayload.append('dni', formData.nationalId);
    formPayload.append('idProfile', '2');
    formPayload.append('idGender', formData.idgender);
    formPayload.append('idprofession', formData.idprofession);
    formPayload.append('datebirth', formData.datebirth);
    formPayload.append('document', this.selectedDocument as Blob);
    formPayload.append('imgprofile', defaultImageFile);

    try {
      const response = await this.http.post(`${environment.apiUrl}/register`, formPayload, {
        responseType: 'text'
      }).toPromise();

      this.showAlert('Registro profesional completado correctamente.');
      this.form.reset();
      this.selectedDocument = null;
      this.router.navigateByUrl('/auth');

    } catch (error) {
      console.error('Error al registrar profesional:', error);
      this.showAlert('Error al registrar profesional.');
    }
  }




  private async showAlert(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Atención',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

}
