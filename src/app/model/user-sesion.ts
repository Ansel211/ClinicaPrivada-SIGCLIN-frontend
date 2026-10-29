import { Rol } from './rol';
import { Modulo } from './modulo';

export interface UserSesion {
  email: string;
  personaId?: number;
  names: string;
  rol: string | Rol;
  modulos?: Modulo[];
}