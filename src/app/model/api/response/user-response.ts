import { Rol } from '../../rol';
import { Modulo } from '../../modulo';

export interface UserResponse {
  token: string;
  username: string;
  nombreCompleto: string;
  role?: Rol | string;     // <-- Rol asignado al usuario
  modules?: Modulo[];      // <-- Lista de vistas a las que tiene acceso
  message: string;
}