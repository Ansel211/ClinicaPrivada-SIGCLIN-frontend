import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '../services/session.service';

export const moduloGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const session = sessionService.getInfoSession();

  if (!session || !session.modulos) {
    return router.createUrlTree(['/login']);
  }

  const currentUrl = state.url;

  // Verificamos si alguna URL de los módulos asignados coincide con la ruta solicitada
  const hasAccess = session.modulos.some(modulo =>
    modulo.activo && (currentUrl.includes(modulo.url) || modulo.url.includes(route.routeConfig?.path || ''))
  );

  if (hasAccess) {
    return true;
  }

  // Si no tiene permiso para esa pantalla, redirigir al primer módulo permitido de su token (ej: /dashboard/pacientes)
  const defaultUrl = session.modulos.length > 0 ? session.modulos[0].url : '/dashboard/pacientes';
  return router.createUrlTree([defaultUrl]);
};