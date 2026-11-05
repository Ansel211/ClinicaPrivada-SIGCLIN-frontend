import { Injectable } from '@angular/core';
import { UserSesion } from '../model/user-sesion';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  
  private getDecodedToken(): any | null {
    const token = localStorage.getItem('user_token');

    if (token) {
    const base64Payload = token.split('.')[1];
     const decodedTokenString = decodeURIComponent(
     atob(base64Payload)
    .split('')
    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
    .join('')
    );
      return JSON.parse(decodedTokenString);
    }
    return null;
  }

  getInfoSession(): UserSesion | null {
    const decodedToken = this.getDecodedToken();
    if (!decodedToken) {
      return null;
    }

    return {
      email: decodedToken.email,
      personaId: decodedToken.personaId,
      names: decodedToken.names,
      rol: decodedToken.role,
      modulos: decodedToken.modules
    };
  }
}