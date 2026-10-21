import { Rol } from './rol';
import { Modulo } from './modulo';

export interface UserSesion {
  username: string;
  nombreCompleto: string;
  rol: Rol | string;
  modulos?: Modulo[];
}