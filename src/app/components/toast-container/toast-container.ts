import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastType } from '../../services/toast.service';
import { NgbToast } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgbToast, CommonModule],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
})
export class ToastContainer {
  toastService = inject(ToastService);

  getToastClass(type: ToastType): string {
    const baseClass = 'text-light mb-2';
    switch (type) {
      case 'success': return `bg-success ${baseClass}`;
      case 'danger': return `bg-danger ${baseClass}`;
      case 'warning': return `bg-warning text-dark ${baseClass}`;
      case 'info': return `bg-info ${baseClass}`;
      default: return baseClass;
    }
  }
}