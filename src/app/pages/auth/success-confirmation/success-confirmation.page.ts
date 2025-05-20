import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success-confirmation',
  templateUrl: './success-confirmation.page.html',
  styleUrls: ['./success-confirmation.page.scss'],
  standalone: false
})
export class SuccessConfirmationPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    setTimeout(() => {
      this.router.navigate(['/auth'], { replaceUrl: true });
    }, 3000); // redirige al login en 3 segundos
  }
}
