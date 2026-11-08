import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

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
  private http = inject(HttpClient);

  listarMedicos(): Observable<Medico[]> {
    return this.http.get<Medico[]>(`${environment.url}/medicos`);
  }
}