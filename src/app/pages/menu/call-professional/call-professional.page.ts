import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-call-professional',
  templateUrl: './call-professional.page.html',
  styleUrls: ['./call-professional.page.scss'],
  standalone: false
})
export class CallProfessionalPage implements OnInit {

  token: string = '';
  sessionId: string = '';

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state;
    if (state) {
      this.token = state['token'];
      this.sessionId = state['sessionId'];
    }
  }

  ngOnInit() {
    console.log('[CallProfessional] token:', this.token);
    console.log('[CallProfessional] sessionId:', this.sessionId);
    // Aquí luego inicializas OpenVidu
  }
}
