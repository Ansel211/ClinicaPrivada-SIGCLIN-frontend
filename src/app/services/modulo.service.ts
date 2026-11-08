import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import{ Modulo } from '../model/modulo';

export type { Modulo };
@Injectable({
  providedIn: 'root'
})
export class ModuloService {
  private http = inject(HttpClient);

  listarModulos(): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(`${environment.url}/modulos`);
  }

  registrarModulo(modulo: Modulo): Observable<Modulo> {
    return this.http.post<Modulo>(`${environment.url}/modulos`, modulo);
  }
}