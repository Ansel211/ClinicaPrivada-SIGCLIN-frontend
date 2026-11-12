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
  
  actualizarPaciente(id: number, paciente: any): Observable<any> {
    return this.http.put<any>(`${environment.url}/pacientes/${id}`, paciente);
  }

  eliminarPaciente(id: number): Observable<any> {
  return this.http.delete<any>(`${environment.url}/pacientes/${id}`);
  }

}