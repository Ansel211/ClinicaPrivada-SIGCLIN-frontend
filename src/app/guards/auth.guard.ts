import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  const token = storageService.getItem('user_token');
  console.log('AuthGuard Token:', token);
  if (token) {
    return true; // Usuario autenticado, se permite el acceso
  }

  // Si no hay token, redirigir al login
  return router.createUrlTree(['/login']);
};