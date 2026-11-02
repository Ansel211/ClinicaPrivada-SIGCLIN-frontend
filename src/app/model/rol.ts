import { Modulo } from './modulo';

export interface Rol {
  idRol?: number;
  codigo: string;
  descripcion: string;
  activo: boolean;
  modulos?: Modulo[];
}