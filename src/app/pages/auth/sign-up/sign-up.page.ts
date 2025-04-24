import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  standalone: false,
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],

})
export class SignUpPage implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),    
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    nationalId: new FormControl('', [Validators.required, Validators.minLength(6)]),
    birthDate: new FormControl('', [Validators.required]),
    gender: new FormControl('', [Validators.required])
  }, { validators: this.passwordMatchValidator });
  constructor() { }

  ngOnInit() {
  }

  async submit(){
    console.log(this.form.value);
  }

  passwordMatchValidator(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

}
