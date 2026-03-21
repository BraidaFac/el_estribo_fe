import {
  BloqueoPrenda,
  CancelarBloqueoPayload,
  TipoPrenda,
} from "@/lib/domain/reservas/types";
import { apiFetch } from "@/lib/services/http";
import { buildQueryString } from "./query-string";

export async function listarBloqueosPorPrenda(
  tipoPrenda: TipoPrenda,
  prendaId: number,
  desde: string,
  hasta: string,
): Promise<BloqueoPrenda[]> {
  return apiFetch<BloqueoPrenda[]>(
    `/v2/bloqueos/prendas/${tipoPrenda}/${prendaId}${buildQueryString({ desde, hasta })}`,
  );
}

export async function cancelarBloqueo(
  bloqueoId: number,
  payload: CancelarBloqueoPayload,
): Promise<BloqueoPrenda> {
  return apiFetch<BloqueoPrenda>(`/v2/bloqueos/${bloqueoId}/cancelar`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
