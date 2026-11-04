import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Modulo {
  idMod?: number;
  descripcion: string;
  url: string;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModuloService {
  private apiUrl = 'http://localhost:8080/api/v1/modulos';

  constructor(private http: HttpClient) {}

  listarModulos(): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(this.apiUrl);
  }

  registrarModulo(modulo: Modulo): Observable<Modulo> {
    return this.http.post<Modulo>(this.apiUrl, modulo);
  }
}