/** Alineado con backend `RecepcionDevolucionPayloadDto`. */

export type BotonesCierresInspeccion = "OK" | "DANO_LEVE";
export type RuedosTelasInspeccion = "OK" | "ENGANCHE" | "ROTURA";
export type DanoGraveInspeccion = "OK" | "QUEMADURA" | "MANCHA_QUIMICA";
export type EstadoGeneralDevolucion = "SUCIIO_O_MANCHADO" | "IMPECABLE";
export type DecisionLavadoPostDevolucion = "LAVANDERIA_EXTERNA" | "LIMPIEZA_LOCAL";

export type RecepcionDevolucionPayload = {
  botonesCierresEstado: BotonesCierresInspeccion;
  botonesCierresCobro?: number | null;
  ruedosTelasEstado: RuedosTelasInspeccion;
  ruedosTelasCobro?: number | null;
  danoGraveEstado: DanoGraveInspeccion;
  danoGraveCobro?: number | null;
  demoraDias?: number | null;
  estadoGeneral: EstadoGeneralDevolucion;
  decisionLavado: DecisionLavadoPostDevolucion;
  responsableLimpiezaLocal?: string | null;
};

export function defaultRecepcionDevolucionPayload(): RecepcionDevolucionPayload {
  return {
    botonesCierresEstado: "OK",
    ruedosTelasEstado: "OK",
    danoGraveEstado: "OK",
    estadoGeneral: "IMPECABLE",
    decisionLavado: "LAVANDERIA_EXTERNA",
    demoraDias: null,
    responsableLimpiezaLocal: null,
  };
}
