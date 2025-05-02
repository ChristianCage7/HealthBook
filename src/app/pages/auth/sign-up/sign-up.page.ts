import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/shared/services/supabase.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sign-up',
  standalone: false,
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],

})
export class SignUpPage implements OnInit {

  form!: FormGroup;

  constructor(
    private supabaseService: SupabaseService,
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      nationalId: new FormControl('', [Validators.required]),
      birthDate: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required])
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
  }

  async submit() {
    if (this.form.invalid) return;    
    const formData = this.form.value;

    console.log('birthDate capturado:', formData.birthDate);

    const payload = {
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dni: formData.nationalId,
      idProfile: 1,
      idGender: parseInt(formData.gender),
      birthDate: formData.birthDate
    };

    try {
      console.log("📦 Payload que se enviará:", payload);
      const response = await this.http.post(`${environment.apiUrl}/register`, payload, { responseType: 'text' }).toPromise();
      console.log('Registro exitoso', response)
      this.form.reset();

    } catch (error) {
      console.error("Error al registrar usuario", error);
    }
  }

  getFormControl(controlName: string): FormControl {
    return this.form.get(controlName) as FormControl;
  }

  passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

}
