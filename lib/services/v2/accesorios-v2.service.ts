import type {
  AccesorioItem,
  CreateAccesorioPayload,
  PatchDevolucionExtrasPayload,
  ReservaExtraItem,
  SetReservaExtrasPayload,
  UpdateAccesorioPayload,
} from "@/lib/domain/accesorios/types";
import { apiFetch } from "@/lib/services/http";

// ── Accesorios CRUD ──────────────────────────────────────────────────────────

export async function listarAccesorios(): Promise<AccesorioItem[]> {
  return apiFetch<AccesorioItem[]>("/v2/accesorios");
}

export async function crearAccesorio(
  payload: CreateAccesorioPayload,
): Promise<AccesorioItem> {
  return apiFetch<AccesorioItem>("/v2/accesorios", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function actualizarAccesorio(
  id: number,
  payload: UpdateAccesorioPayload,
): Promise<AccesorioItem> {
  return apiFetch<AccesorioItem>(`/v2/accesorios/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function eliminarAccesorio(id: number): Promise<void> {
  await apiFetch<void>(`/v2/accesorios/${id}`, { method: "DELETE" });
}

// ── ReservaExtras ────────────────────────────────────────────────────────────

export async function obtenerExtrasReserva(
  reservaId: number,
): Promise<ReservaExtraItem[]> {
  return apiFetch<ReservaExtraItem[]>(`/v2/reservas/${reservaId}/extras`);
}

export async function setExtrasReserva(
  reservaId: number,
  payload: SetReservaExtrasPayload,
): Promise<ReservaExtraItem[]> {
  return apiFetch<ReservaExtraItem[]>(`/v2/reservas/${reservaId}/extras`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function patchDevolucionExtras(
  reservaId: number,
  payload: PatchDevolucionExtrasPayload,
): Promise<ReservaExtraItem[]> {
  return apiFetch<ReservaExtraItem[]>(
    `/v2/reservas/${reservaId}/extras/devolucion`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}
