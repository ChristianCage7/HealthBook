import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { supabase } from 'src/app/shared/services/supabase.client';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-success-confirmation',
  templateUrl: './success-confirmation.page.html',
  styleUrls: ['./success-confirmation.page.scss'],
  standalone: false
})
export class SuccessConfirmationPage implements OnInit {
  loading = true;
  confirmed = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

 async ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    const type = this.route.snapshot.queryParamMap.get('type');

    console.log('token:', token);
    console.log('type:', type);

    if (!token || type !== 'signup') {
      this.loading = false;
      this.confirmed = false;
      return;
    }

    try {
      await this.http.get(`${environment.apiUrl}/confirm-account?token=${token}`).toPromise();
      this.confirmed = true;
      setTimeout(() => this.router.navigate(['/auth']), 3000);
    } catch (err) {
      console.error('Error al confirmar cuenta desde backend:', err);
      this.confirmed = false;
    } finally {
      this.loading = false;
    }
  }
}