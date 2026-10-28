import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CitaRequest {
  paciente: { idPaciente: number };
  medico: { id: number };
  fecha: string;
  hora: string;
  duracionMinutos: number;
  tipoConsulta: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/citas';

  listarCitas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  registrarCita(payload: CitaRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
}