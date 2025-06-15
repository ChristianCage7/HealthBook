import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-professional-dashboard',
  templateUrl: './professional-dashboard.page.html',
  styleUrls: ['./professional-dashboard.page.scss'],
  standalone: false

})
export class ProfessionalDashboardPage implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  goToManageAvailability() {
    this.router.navigate(['/menu/manage-availability']);
  }
}
