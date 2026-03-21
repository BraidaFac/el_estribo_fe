import { Pantalon } from "@/lib/domain/reservas/types";
import { apiFetch } from "@/lib/services/http";

export type CreatePantalonPayload = {
  codigo: string;
  marca: string;
  talle?: string;
  color?: string;
  condicion?: Pantalon["condicion"];
};

export type UpdatePantalonPayload = Partial<CreatePantalonPayload>;

export async function listarPantalones(): Promise<Pantalon[]> {
  return apiFetch<Pantalon[]>("/v2/pantalones");
}

export async function crearPantalon(
  payload: CreatePantalonPayload,
): Promise<Pantalon> {
  return apiFetch<Pantalon>("/v2/pantalones", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function actualizarPantalon(
  id: number,
  payload: UpdatePantalonPayload,
): Promise<Pantalon> {
  return apiFetch<Pantalon>(`/v2/pantalones/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function eliminarPantalon(
  id: number,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/v2/pantalones/${id}`, {
    method: "DELETE",
  });
}
