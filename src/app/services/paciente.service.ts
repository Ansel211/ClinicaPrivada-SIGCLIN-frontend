import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private http = inject(HttpClient);

  listarPacientes(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.url}/pacientes`);
  }

  registrarPaciente(paciente: any): Observable<any> {
    return this.http.post<any>(`${environment.url}/pacientes`, paciente);
  }
}