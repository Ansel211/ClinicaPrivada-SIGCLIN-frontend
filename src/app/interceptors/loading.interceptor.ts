import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('medicos')) {
    return next(req);
  }
  const loadingService = inject(LoadingService);

  loadingService.show(); //muestra el spinner antes de enviar la peticion

  return next(req).pipe(
    finalize(() => {
      loadingService.hide(); //oculta el spinner cuando la peticion se completa, ya sea con exito o error 
    })
  );
};