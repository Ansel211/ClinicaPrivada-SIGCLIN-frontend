import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { UserRequest } from '../model/api/request/user-request';
import { UserResponse } from '../model/api/response/user-response';
import { Observable, tap } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private storageService = inject(StorageService);

  private _isLoggedIn = signal<boolean>(this.hasToken());
  isLoggedIn = this._isLoggedIn.asReadonly();

  login(user: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${environment.url}/auth/login`, user).pipe(
      tap((response: UserResponse) => {
        if (response && response.token) {
          // Limpiar token anterior y asignar el nuevo
          this.storageService.removeItem('user_token');
          this.storageService.setItem('user_token', response.token);
          this._isLoggedIn.set(true);
        }
      })
    );
  }

  public setToken(token: string) {
    this.storageService.setItem('user_token', token);
    this._isLoggedIn.set(true);
  }

  private hasToken(): boolean {
    return !!this.storageService.getItem("user_token");
  }

  logout(): void {
    this.storageService.removeItem('user_token');
    this._isLoggedIn.set(false);
  }
}