import { DiaNoLaborable } from "@/lib/domain/reservas/types";
import { apiFetch } from "@/lib/services/http";
import { buildQueryString } from "./query-string";

export async function listarDiasNoLaborables(
  desde: string,
  hasta: string,
): Promise<DiaNoLaborable[]> {
  return apiFetch<DiaNoLaborable[]>(
    `/v2/calendario-laboral/dias-no-laborables${buildQueryString({ desde, hasta })}`,
  );
}
