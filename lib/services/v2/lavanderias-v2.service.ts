import { Lavanderia, PrecioHistoricoLavanderia } from "@/lib/domain/reservas/types";
import { apiFetch } from "@/lib/services/http";

export interface CreateLavanderiaPayload {
  nombre: string;
  telefono?: string;
  direccion?: string;
  predeterminada?: boolean;
}

export type UpdateLavanderiaPayload = Partial<CreateLavanderiaPayload>;

export interface CreatePrecioPayload {
  precio: number;
  vigenciaDesde: string;
}

export type UpdatePrecioPayload = Partial<CreatePrecioPayload>;

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

// ── Precios históricos ────────────────────────────────────────────────────────

export async function listarPreciosLavanderia(
  id: number,
): Promise<PrecioHistoricoLavanderia[]> {
  return apiFetch<PrecioHistoricoLavanderia[]>(`/v2/lavanderias/${id}/precios`);
}

export async function agregarPrecioLavanderia(
  id: number,
  payload: CreatePrecioPayload,
): Promise<PrecioHistoricoLavanderia> {
  return apiFetch<PrecioHistoricoLavanderia>(`/v2/lavanderias/${id}/precios`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function actualizarPrecioLavanderia(
  id: number,
  precioId: number,
  payload: UpdatePrecioPayload,
): Promise<PrecioHistoricoLavanderia> {
  return apiFetch<PrecioHistoricoLavanderia>(
    `/v2/lavanderias/${id}/precios/${precioId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function eliminarPrecioLavanderia(
  id: number,
  precioId: number,
): Promise<void> {
  await apiFetch<void>(`/v2/lavanderias/${id}/precios/${precioId}`, {
    method: "DELETE",
  });
}
