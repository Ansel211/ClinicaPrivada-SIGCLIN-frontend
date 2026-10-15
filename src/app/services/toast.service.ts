import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface Toast {
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Usamos una Signal para que Angular detecte cambios en el HTML automáticamente
  toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'info') {
    const newToast: Toast = { message, type };
    this.toasts.update((current) => [...current, newToast]);

    // Ocultar automáticamente después de 3 segundos
    setTimeout(() => {
      this.remove(newToast);
    }, 3000);
  }

  showSuccess(message: string) {
    this.show(message, 'success');
  }

  showError(message: string) {
    this.show(message, 'danger');
  }

  remove(toast: Toast) {
    this.toasts.update((current) => current.filter((t) => t !== toast));
  }
}