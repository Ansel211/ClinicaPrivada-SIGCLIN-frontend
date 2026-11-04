import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

export const moduloGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const session = sessionService.getInfoSession();
  console.log('🔍 ModuloGuard Session:', session); // <-- VER EN CONSOLA
  console.log('🔍 Ruta intentada (state.url):', state.url);
  if (!session || !session.modulos) {
    return router.createUrlTree(['/login']);
  }

  // state.url contiene la ruta a la que intenta acceder (ej: "/dashboard/registrar-rol")
  const currentUrl = state.url;

  // Verificamos si alguna URL de los módulos asignados coincide con la ruta solicitada
  const hasAccess = session.modulos.some(modulo => 
    modulo.activo && (currentUrl.includes(modulo.url) || modulo.url.includes(route.routeConfig?.path || ''))
  );
 console.log('🔍 ¿Tiene acceso?:', hasAccess); 
  if (hasAccess) {
    return true;
  }

  // Si no tiene permiso para esa pantalla, redirigir al panel principal
  return router.createUrlTree(['/dashboard']);
};