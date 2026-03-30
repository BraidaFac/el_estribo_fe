import type {
  BotonesCierresInspeccion,
  DanoGraveInspeccion,
  DecisionLavadoPostDevolucion,
  EstadoGeneralDevolucion,
  RuedosTelasInspeccion,
} from "@/lib/domain/reservas/recepcionDevolucion";

export function labelBotonesCierres(v: BotonesCierresInspeccion): string {
  switch (v) {
    case "OK":
      return "OK";
    case "DANO_LEVE":
      return "Daño leve";
    default:
      return v;
  }
}

export function labelRuedosTelas(v: RuedosTelasInspeccion): string {
  switch (v) {
    case "OK":
      return "OK";
    case "ENGANCHE":
      return "Enganche";
    case "ROTURA":
      return "Rotura";
    default:
      return v;
  }
}

export function labelDanoGrave(v: DanoGraveInspeccion): string {
  switch (v) {
    case "OK":
      return "OK";
    case "QUEMADURA":
      return "Quemadura";
    case "MANCHA_QUIMICA":
      return "Mancha química";
    default:
      return v;
  }
}

export function labelEstadoGeneral(v: EstadoGeneralDevolucion): string {
  switch (v) {
    case "SUCIIO_O_MANCHADO":
      return "Sucio o manchado";
    case "IMPECABLE":
      return "Impecable (olor neutro)";
    default:
      return v;
  }
}

export function labelDecisionLavado(v: DecisionLavadoPostDevolucion): string {
  switch (v) {
    case "LAVANDERIA_EXTERNA":
      return "Lavandería externa";
    case "LIMPIEZA_LOCAL":
      return "Limpieza local";
    default:
      return v;
  }
}
