import type {
  CreateControlPreEntregaPayload,
  PlanillaPrepararFila,
  RechazoPreEntregaFila,
} from "@/lib/domain/control-pre-entrega/types";
import { apiFetch } from "@/lib/services/http";

export async function fetchPlanillaPrepararEntrega(): Promise<PlanillaPrepararFila[]> {
  return apiFetch<PlanillaPrepararFila[]>("/v2/control-pre-entrega/planilla-preparar");
}

export async function fetchRechazadosPreEntrega(): Promise<RechazoPreEntregaFila[]> {
  return apiFetch<RechazoPreEntregaFila[]>("/v2/control-pre-entrega/rechazados");
}

export async function crearControlPreEntrega(
  payload: CreateControlPreEntregaPayload,
): Promise<unknown> {
  return apiFetch("/v2/control-pre-entrega", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resolverRechazoPreEntrega(
  controlId: number,
): Promise<unknown> {
  return apiFetch(`/v2/control-pre-entrega/${controlId}/resolver-rechazo`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
}
