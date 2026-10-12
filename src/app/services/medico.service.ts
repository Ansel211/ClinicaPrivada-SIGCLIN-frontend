import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  listarMedicos(): Observable<Medico[]> {
    return this.http.get<Medico[]>(this.apiUrl);
  }
}