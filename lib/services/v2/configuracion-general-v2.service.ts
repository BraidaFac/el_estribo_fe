import { ConfiguracionGeneral } from "@/lib/domain/reservas/types";
import { apiFetch } from "@/lib/services/http";

export type UpdateConfiguracionGeneralPayload = Partial<
  Pick<
    ConfiguracionGeneral,
    "diasLavanderia" | "diasModista" | "diasTomarMediciones" | "cantidadDiasPermitidoRetiro"
  >
>;

export async function obtenerConfiguracionGeneral(): Promise<ConfiguracionGeneral> {
  return apiFetch<ConfiguracionGeneral>("/v2/configuracion-general");
}

export async function actualizarConfiguracionGeneral(
  payload: UpdateConfiguracionGeneralPayload,
): Promise<ConfiguracionGeneral> {
  return apiFetch<ConfiguracionGeneral>("/v2/configuracion-general", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
