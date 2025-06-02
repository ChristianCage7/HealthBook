import { Injectable } from '@angular/core';
import { CustomToastComponent } from '../components/custom-toast/custom-toast.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toastComponent!: CustomToastComponent;

  register(toast: CustomToastComponent) {
    this.toastComponent = toast;
  }

  show(message: string, heading = 'Notificación', type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    if (this.toastComponent) {
      this.toastComponent.showToast(message, heading, type);
    }
  }
}
