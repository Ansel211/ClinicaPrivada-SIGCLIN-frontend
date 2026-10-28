import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/pacientes';

  listarPacientes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  registrarPaciente(paciente: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, paciente);
  }
}