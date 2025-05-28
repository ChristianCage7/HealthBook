import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SupabaseService } from 'src/app/shared/services/supabase.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: false,
})
export class AuthPage implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  loading = false;
  errorMessage: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit() {
    console.log('[Login] Componente inicializado');
  }

  async submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = null;

    const { email, password } = this.form.value!;
    const { data, error } = await this.supabaseService.signIn(email!, password!);

    this.loading = false;

    if (error) {
      this.errorMessage = error.message;
      return;
    }

    // Esperar el resultado de isCreditor() como promesa
    const isCreditor = await this.userService.isCreditor().toPromise();

    if (isCreditor) {
      console.log('Usuario es creditor, redirigiendo a /menu/creditor');
      this.router.navigateByUrl('/menu/creditor', { replaceUrl: true });
    } else {
      console.log('Usuario no es creditor, redirigiendo a /menu');
      this.router.navigateByUrl('/menu', { replaceUrl: true });
    }
  }



}