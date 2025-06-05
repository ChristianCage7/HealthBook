import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-toast',
  templateUrl: './custom-toast.component.html',
  styleUrls: ['./custom-toast.component.scss'],
  standalone: false
})
export class CustomToastComponent {
  @Input() heading = 'Notificación';
  @Input() description = 'Mensaje de ejemplo';
  @Input() type: 'success' | 'error' | 'info' | 'warning' = 'info';
  isActive = false;

  showToast(message: string, heading = 'Notificación', type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    this.heading = heading;
    this.description = message;
    this.type = type;
    this.isActive = true;

    setTimeout(() => {
      this.isActive = false;
    }, 4000);
  }

  closeToast() {
    this.isActive = false;
  }

  getIconName(): string {
    switch (this.type) {
      case 'success': return 'checkmark-circle-outline';
      case 'error': return 'close-circle-outline';
      case 'info': return 'information-circle-outline';
      case 'warning': return 'alert-circle-outline';
      default: return 'checkmark-circle-outline';
    }
  }

}