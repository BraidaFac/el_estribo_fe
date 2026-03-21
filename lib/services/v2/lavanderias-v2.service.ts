import { Lavanderia } from "@/lib/domain/reservas/types";
import { apiFetch } from "@/lib/services/http";

export interface CreateLavanderiaPayload {
  nombre: string;
  telefono?: string;
  direccion?: string;
  predeterminada?: boolean;
}

export type UpdateLavanderiaPayload = Partial<CreateLavanderiaPayload>;

export async function listarLavanderias(): Promise<Lavanderia[]> {
  return apiFetch<Lavanderia[]>("/v2/lavanderias");
}

export async function obtenerLavanderia(id: number): Promise<Lavanderia> {
  return apiFetch<Lavanderia>(`/v2/lavanderias/${id}`);
}

export async function crearLavanderia(
  payload: CreateLavanderiaPayload,
): Promise<Lavanderia> {
  return apiFetch<Lavanderia>("/v2/lavanderias", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function actualizarLavanderia(
  id: number,
  payload: UpdateLavanderiaPayload,
): Promise<Lavanderia> {
  return apiFetch<Lavanderia>(`/v2/lavanderias/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function eliminarLavanderia(
  id: number,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/v2/lavanderias/${id}`, {
    method: "DELETE",
  });
}

export async function setLavanderiaPredeterminada(id: number): Promise<void> {
  await apiFetch<void>(`/v2/lavanderias/${id}/predeterminada`, {
    method: "PATCH",
  });
}
