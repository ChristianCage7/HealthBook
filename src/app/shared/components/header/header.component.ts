import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Input() title!: string;
  @Input() showBackButton: boolean = true;
  @Input() defaultHref?: string;

  resolvedDefaultHref: string = '/menu'; // fallback general

  ngOnInit() {
    if (this.defaultHref) {
      this.resolvedDefaultHref = this.defaultHref;
      return;
    }

    try {
      const userStr = localStorage.getItem('currentUser');
      const user = userStr ? JSON.parse(userStr) : null;

      switch (user?.idrole) {
        case 2:
          this.resolvedDefaultHref = '/menu/professional-dashboard';
          break;
        case 3:
          this.resolvedDefaultHref = '/menu/creditor';
          break;
        default:
          this.resolvedDefaultHref = '/menu';
      }
    } catch {
      this.resolvedDefaultHref = '/menu';
    }
  }
}
