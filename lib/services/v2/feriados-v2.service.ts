import { apiFetch } from "@/lib/services/http";

export type FeriadoOrigen = "API" | "MANUAL";

export interface FeriadoV2 {
  id: number;
  fecha: string;
  motivo: string | null;
  origen: FeriadoOrigen;
  tipo: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CrearFeriadoPayload {
  fecha: string;
  motivo: string;
}

export type ActualizarFeriadoPayload = Partial<CrearFeriadoPayload>;

export async function listarFeriados(ano?: number): Promise<FeriadoV2[]> {
  const qs =
    ano !== undefined && !Number.isNaN(ano) ? `?ano=${encodeURIComponent(String(ano))}` : "";
  return apiFetch<FeriadoV2[]>(`/v2/feriados${qs}`);
}

export async function obtenerFeriado(id: number): Promise<FeriadoV2> {
  return apiFetch<FeriadoV2>(`/v2/feriados/${id}`);
}

export async function crearFeriado(payload: CrearFeriadoPayload): Promise<FeriadoV2> {
  return apiFetch<FeriadoV2>("/v2/feriados", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function actualizarFeriado(
  id: number,
  payload: ActualizarFeriadoPayload,
): Promise<FeriadoV2> {
  return apiFetch<FeriadoV2>(`/v2/feriados/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function eliminarFeriado(id: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/v2/feriados/${id}`, {
    method: "DELETE",
  });
}
