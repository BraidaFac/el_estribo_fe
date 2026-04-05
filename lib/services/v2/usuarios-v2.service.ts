import type {
  CreateUsuarioPayload,
  UpdateUsuarioPayload,
  UsuarioItem,
} from "@/lib/domain/usuarios/types";
import { apiFetch } from "@/lib/services/http";

export async function listarUsuarios(): Promise<UsuarioItem[]> {
  return apiFetch<UsuarioItem[]>("/v2/users");
}

export async function crearUsuario(
  payload: CreateUsuarioPayload,
): Promise<UsuarioItem> {
  return apiFetch<UsuarioItem>("/v2/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function actualizarUsuario(
  id: string,
  payload: UpdateUsuarioPayload,
): Promise<UsuarioItem> {
  return apiFetch<UsuarioItem>(`/v2/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function eliminarUsuario(id: string): Promise<void> {
  await apiFetch<void>(`/v2/users/${id}`, { method: "DELETE" });
}
