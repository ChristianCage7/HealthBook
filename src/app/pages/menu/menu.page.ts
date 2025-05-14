import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: false
})
export class MenuPage {

  currentUrl: string= '';

  constructor(private router: Router) {
    this.router.events.subscribe(()=>{
      this.currentUrl = this.router.url;
    })
  }

  logoutConfirm(){}
}
