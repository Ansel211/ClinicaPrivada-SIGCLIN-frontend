import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { NUsuariosXRol } from '../model/api/response/nusuarios-xrol';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {
  private http = inject(HttpClient);

  getNUsuariosXRol(): Observable<NUsuariosXRol[]> {
    return this.http.get<NUsuariosXRol[]>(`${environment.url}/personas/NUsuariosXRol`);
  }
}