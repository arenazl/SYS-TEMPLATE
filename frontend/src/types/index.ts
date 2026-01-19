export type RolUsuario = 'usuario' | 'admin';

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  activo: boolean;
  created_at: string;
}
