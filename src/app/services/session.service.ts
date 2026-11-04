import { Injectable } from '@angular/core';
import { UserSesion } from '../model/user-sesion';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private getDecodedToken():any|null{
    const token = localStorage.getItem('user_token');

    if (token) {
      const decodedTokenString=atob(token.split('.')[1]);
      return JSON.parse(decodedTokenString);
    };
    return null;
  }

  getInfoSession(): UserSesion | null {
    const decodedToken = this.getDecodedToken();
    if (!decodedToken) {
      return null;
    }

    // Intentar obtener módulos del token o caer en el LocalStorage
    let modulos = decodedToken.modules;
    if (!modulos) {
      const localModules = localStorage.getItem('user_modules');
      if (localModules) {
        try {
          modulos = JSON.parse(localModules);
        } catch (e) {
          modulos = [];
        }
      }
    }

    return {
      email: decodedToken.email,
      personaId: decodedToken.personaId,
      names: decodedToken.names,
      rol: decodedToken.role,
      modulos: modulos || []
    };
  }


}