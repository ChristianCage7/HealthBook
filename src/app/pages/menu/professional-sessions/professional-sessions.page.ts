import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-professional-sessions',
  templateUrl: './professional-sessions.page.html',
  styleUrls: ['./professional-sessions.page.scss'],
  standalone: false

})
export class ProfessionalSessionsPage implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {}

  goToManageAvailability() {
    this.router.navigate(['/menu/manage-availability']);
  }
}
