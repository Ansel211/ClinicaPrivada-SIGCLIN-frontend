import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CitaRequest {
  pacienteDni?: string;
  idMedico: number;
  fecha: string;
  hora: string;
  especialidad?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  // Ajusta el puerto o URL del endpoint de tu API de Spring Boot
  private apiUrl = 'http://localhost:8080/api/citas';

  constructor(private http: HttpClient) {}

  registrarCita(citaData: CitaRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, citaData);
  }

  listarCitas(): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/listar`, {});
  }

  obtenerTotalCitasHoy(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/hoy/total`);
  }
}