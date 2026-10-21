import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Medico {
  id: number;
  nombre: string;
  especialidad: string;
  disponibilidad: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private apiUrl = 'http://localhost:8080/api/medicos';

  constructor(private http: HttpClient) {}

  listarMedicos(): Observable<Medico[]> { //Realiza una petición GET a la API de médicos. Lee el token almacenado manualmente desde localStorage y construye el encabezado
    const token = localStorage.getItem('token'); 
    const header = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Medico[]>(this.apiUrl, { headers: header });
  }
}