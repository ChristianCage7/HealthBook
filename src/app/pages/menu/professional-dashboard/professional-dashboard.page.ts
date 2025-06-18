import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-professional-dashboard',
  templateUrl: './professional-dashboard.page.html',
  styleUrls: ['./professional-dashboard.page.scss'],
  standalone: false

})
export class ProfessionalDashboardPage implements OnInit {

  showAnimation = false;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    const alreadyAnimated = localStorage.getItem('welcome_animated');

    if (!alreadyAnimated) {
      this.showAnimation = true;
      localStorage.setItem('welcome_animated', 'true');
    }
  }

  goToManageAvailability() {
    this.router.navigate(['/menu/manage-availability']);
  }

  goToMedicalHistory() {
    this.router.navigate(['/menu/professional-dashboard/medical-history']);
  }
}
