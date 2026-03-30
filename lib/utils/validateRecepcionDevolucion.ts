import type { RecepcionDevolucionPayload } from "@/lib/domain/reservas/recepcionDevolucion";

const cobroValido = (n?: number | null) =>
  n != null && !Number.isNaN(Number(n)) && Number(n) > 0;

/** Reglas alineadas con `assertRecepcionDevolucionPayload` en backend. */
export function validateRecepcionDevolucionPayload(
  p: RecepcionDevolucionPayload,
): string | null {
  if (p.botonesCierresEstado === "DANO_LEVE") {
    if (!cobroValido(p.botonesCierresCobro)) {
      return "Indique el monto de cobro por arreglo (botones/cierres)";
    }
  } else if (p.botonesCierresCobro != null && Number(p.botonesCierresCobro) > 0) {
    return "No informe cobro en botones/cierres si el estado es OK";
  }

  if (p.ruedosTelasEstado === "ENGANCHE" || p.ruedosTelasEstado === "ROTURA") {
    if (!cobroValido(p.ruedosTelasCobro)) {
      return "Indique el monto de cobro por arreglo (ruedos/telas)";
    }
  } else if (p.ruedosTelasCobro != null && Number(p.ruedosTelasCobro) > 0) {
    return "No informe cobro en ruedos/telas si el estado es OK";
  }

  if (p.danoGraveEstado === "QUEMADURA" || p.danoGraveEstado === "MANCHA_QUIMICA") {
    if (!cobroValido(p.danoGraveCobro)) {
      return "Indique el monto por traje nuevo (daño grave)";
    }
  } else if (p.danoGraveCobro != null && Number(p.danoGraveCobro) > 0) {
    return "No informe monto por traje nuevo si el daño grave es OK";
  }

  if (p.decisionLavado === "LIMPIEZA_LOCAL" && !p.responsableLimpiezaLocal?.trim()) {
    return "Indique el responsable de limpieza local";
  }

  return null;
}
