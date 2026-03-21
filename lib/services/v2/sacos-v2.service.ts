import { Saco } from "@/lib/domain/reservas/types";
import { apiFetch } from "@/lib/services/http";

export type CreateSacoPayload = {
  codigo: string;
  marca: string;
  talle?: string;
  color?: string;
  condicion?: Saco["condicion"];
};

export type UpdateSacoPayload = Partial<CreateSacoPayload>;

export async function listarSacos(): Promise<Saco[]> {
  return apiFetch<Saco[]>("/v2/sacos");
}

export async function crearSaco(payload: CreateSacoPayload): Promise<Saco> {
  return apiFetch<Saco>("/v2/sacos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function actualizarSaco(
  id: number,
  payload: UpdateSacoPayload,
): Promise<Saco> {
  return apiFetch<Saco>(`/v2/sacos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function eliminarSaco(id: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/v2/sacos/${id}`, {
    method: "DELETE",
  });
}
