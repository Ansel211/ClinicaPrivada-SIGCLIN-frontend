import { Modulo } from '../../modulo';

export interface UserResponse {
  token: string;
  email?: string;
  nombreCompleto: string;
  message: string;
  rolCodigo?: string;
  modulos?: Modulo[];
}