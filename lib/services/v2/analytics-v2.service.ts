import type { BiQueryParams, BiResponse } from "@/lib/domain/analytics/types";
import { apiFetch } from "@/lib/services/http";

export async function fetchBiData(params: BiQueryParams): Promise<BiResponse> {
  const qs = new URLSearchParams({
    desde: params.desde,
    hasta: params.hasta,
    granularidad: params.granularidad,
  }).toString();
  return apiFetch<BiResponse>(`/v2/analytics/bi?${qs}`);
}
