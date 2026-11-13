import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { NCitasXMedico } from '../model/api/response/ncitas-xmedico';

export interface CitaRequest {
  paciente: { idPaciente: number };
  medico: { id: number };
  fecha: string;
  hora: string;
  duracionMinutos: number;
  tipoConsulta: string;
}
//para citasPorFecha
export interface CitasPorFecha {
  fecha: string;
  cantidad: number;
}

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private http = inject(HttpClient);

  listarCitas(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.url}/citas`);
  }

  registrarCita(payload: CitaRequest): Observable<any> {
    return this.http.post<any>(`${environment.url}/citas`, payload);
  }

  getNCitasXMedico(): Observable<NCitasXMedico[]> {
    return this.http.get<NCitasXMedico[]>(`${environment.url}/citas/NCitasXMedico`);
  }

  getCitasPorFecha(): Observable<CitasPorFecha[]> {
    return this.http.get<CitasPorFecha[]>(`${environment.url}/citas/CitasPorFecha`);
  }

  // Metodo para obtener las citas del calendario (con filtros opcionales)
  obtenerCitasCalendario(idMedico?: number, fechaInicio?: string, fechaFin?: string): Observable<any[]> {
    let params: any = {};
    if (idMedico) params.idMedico = idMedico;
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;

    return this.http.get<any[]>(`${environment.url}/citas/calendario`, { params });
  }
  
  obtenerHorasOcupadas(idMedico: number, fecha: string): Observable<string[]> {
  return this.http.get<string[]>(`${environment.url}/citas/ocupadas/${idMedico}/${fecha}`);
  }

  obtenerCuposLibres(idMedico: number, fecha: string, duracionMinutos: number): Observable<string[]> {
  return this.http.get<string[]>(`${environment.url}/citas/cupos-libres?idMedico=${idMedico}&fecha=${fecha}&duracionMinutos=${duracionMinutos}`);
  }

}