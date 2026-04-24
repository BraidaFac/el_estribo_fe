export type TipoPasoCompletado =
  | "CONTACTO_MEDICION_MARCADO"
  | "MEDICION_PROGRAMADA"
  | "MEDICIONES_REGISTRADAS"
  | "LAVANDERIA_OMITIDA"
  | "MODISTA_OMITIDA"
  | "ENVIO_LAVANDERIA"
  | "RECEPCION_LAVANDERIA"
  | "ENVIO_MODISTA"
  | "RECEPCION_MODISTA"
  | "CONTROL_PRE_ENTREGA"
  | "RETIRO_CLIENTE"
  | "DEVOLUCION_CLIENTE";

export interface PasoCompletado {
  id: string;
  tipo: TipoPasoCompletado;
  descripcion: string;
  fechaCompletado: string;
  tipoPrenda?: "SACO" | "PANTALON";
  tareaId?: number;
  agendaId?: number;
  puedeRevertirse: boolean;
}

export interface RevertirUltimoPasoPayload {
  tipo: TipoPasoCompletado;
  tareaId?: number;
  agendaId?: number;
  motivo: string;
}
