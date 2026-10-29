import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';

let isHandling401 = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Define las URLs públicas que no necesitan token de seguridad
  const excludedPaths = [
    '/auth/login',
    '/auth/refresh',
  ];

  const shouldExclude = excludedPaths.some(path => req.url.includes(path));

  if (shouldExclude) {
    return next(req);
  }

  const token = storageService.getItem("user_token");
  let authReq = req;

  if (token) {
    isHandling401 = false;
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        if (!isHandling401) {
          isHandling401 = true;
          authService.logout();
          storageService.removeItem("user_token");
          alert('Su sesión ha caducado debe volver a iniciar sesión');
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};