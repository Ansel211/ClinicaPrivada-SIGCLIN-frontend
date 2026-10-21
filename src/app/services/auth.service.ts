import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { UserRequest } from '../model/api/request/user-request';
import { UserResponse } from '../model/api/response/user-response';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private storageService = inject(StorageService);

  // Estado reactivo de la sesión
  private _isLoggedIn = signal<boolean>(this.hasToken());
  isLoggedIn = this._isLoggedIn.asReadonly();

  login(user: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${environment.url}/auth/login`, user).pipe(
      tap((response: UserResponse) => {
        if (response && response.token) {
          // Guardamos el token REAL que responde el backend
          this.storageService.setItem('user_token', response.token);
          
          if (response.role) {
            const roleName = typeof response.role === 'string' ? response.role : response.role.nombre;
            this.storageService.setItem('user_role', roleName);
          }

          if (response.username) {
            this.storageService.setItem('user_name', response.username);
          }

          this._isLoggedIn.set(true);
        }
      })
    );
  }

  private hasToken(): boolean {
    return !!this.storageService.getItem('user_token');
  }

  getUserRole(): string | null {
    return this.storageService.getItem('user_role');
  }

  logout(): void {
    this.storageService.removeItem('user_token');
    this.storageService.removeItem('user_role');
    this.storageService.removeItem('user_name');
    this._isLoggedIn.set(false);
  }
}