export type UserRole = "ADMIN" | "USER";

export type UsuarioItem = {
  id: string;
  name: string;
  userName: string;
  role: UserRole;
  activo: boolean;
};

export type CreateUsuarioPayload = {
  name: string;
  userName: string;
  password: string;
  role: UserRole;
};

export type UpdateUsuarioPayload = {
  name?: string;
  userName?: string;
  password?: string;
  role?: UserRole;
};
