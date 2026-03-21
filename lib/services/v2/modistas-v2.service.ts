import { Modista } from "@/lib/domain/reservas/types";
import { apiFetch } from "@/lib/services/http";

export interface CreateModistaPayload {
  nombre: string;
  telefono?: string;
  direccion?: string;
  predeterminada?: boolean;
}

export type UpdateModistaPayload = Partial<CreateModistaPayload>;

export async function listarModistas(): Promise<Modista[]> {
  return apiFetch<Modista[]>("/v2/modistas");
}

export async function obtenerModista(id: number): Promise<Modista> {
  return apiFetch<Modista>(`/v2/modistas/${id}`);
}

export async function crearModista(
  payload: CreateModistaPayload,
): Promise<Modista> {
  return apiFetch<Modista>("/v2/modistas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function actualizarModista(
  id: number,
  payload: UpdateModistaPayload,
): Promise<Modista> {
  return apiFetch<Modista>(`/v2/modistas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function eliminarModista(id: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/v2/modistas/${id}`, {
    method: "DELETE",
  });
}

export async function setModistaPredeterminada(id: number): Promise<void> {
  await apiFetch<void>(`/v2/modistas/${id}/predeterminada`, {
    method: "PATCH",
  });
}
