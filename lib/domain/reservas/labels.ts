import {
  EstadoAgendaMedicion,
  EstadoBloqueo,
  EstadoReserva,
  EstadoTareaOperativa,
  EstadoUbicacionPrenda,
  OrigenBloqueo,
  PrioridadTareaOperativa,
  TipoBloqueo,
  TipoTareaOperativa,
} from "@/lib/domain/reservas/types";

export function getEstadoReservaLabel(estado: EstadoReserva): string {
  switch (estado) {
    case "PENDIENTE":
      return "Pendiente";
    case "CONFIRMADA":
      return "Confirmada";
    case "EN_CURSO":
      return "En curso";
    case "COMPLETADA":
      return "Completada";
    case "CANCELADA":
      return "Cancelada";
    default:
      return estado;
  }
}

export function getEstadoUbicacionPrendaLabel(estado: EstadoUbicacionPrenda): string {
  switch (estado) {
    case "TIENDA":
      return "En tienda";
    case "EN_MODISTA":
      return "En modista";
    case "EN_LAVANDERIA":
      return "En lavanderia";
    case "RETIRADO_CLIENTE":
      return "Retirado por cliente";
    default:
      return estado;
  }
}

export function getTipoBloqueoLabel(tipo: TipoBloqueo): string {
  switch (tipo) {
    case "MEDICION":
      return "Medicion";
    case "RESERVA":
      return "Reserva";
    case "MODISTA":
      return "Modista";
    case "LISTO_TIENDA":
      return "Listo en tienda";
    case "LAVANDERIA":
      return "Lavanderia";
    case "MANTENIMIENTO":
      return "Mantenimiento";
    case "MANUAL":
      return "Manual";
    default:
      return tipo;
  }
}

export function getEstadoBloqueoLabel(estado: EstadoBloqueo): string {
  switch (estado) {
    case "ACTIVO":
      return "Activo";
    case "CANCELADO":
      return "Cancelado";
    default:
      return estado;
  }
}

export function getOrigenBloqueoLabel(origen: OrigenBloqueo): string {
  switch (origen) {
    case "AUTOMATICO":
      return "Automatico";
    case "MANUAL":
      return "Manual";
    default:
      return origen;
  }
}

export function getEstadoTareaOperativaLabel(estado: EstadoTareaOperativa): string {
  switch (estado) {
    case "PENDIENTE":
      return "Pendiente";
    case "EN_PROCESO":
      return "En proceso";
    case "COMPLETADA":
      return "Completada";
    case "CANCELADA":
      return "Cancelada";
    default:
      return estado;
  }
}

export function getPrioridadTareaOperativaLabel(prioridad: PrioridadTareaOperativa): string {
  switch (prioridad) {
    case "ALTA":
      return "Alta";
    case "MEDIA":
      return "Media";
    case "BAJA":
      return "Baja";
    default:
      return prioridad;
  }
}

export function getEstadoAgendaMedicionLabel(estado: EstadoAgendaMedicion): string {
  switch (estado) {
    case "PROGRAMADA":
      return "Programada";
    case "ASISTIO":
      return "Asistio";
    case "NO_ASISTIO":
      return "No asistio";
    case "REPROGRAMADA":
      return "Reprogramada";
    case "CANCELADA":
      return "Cancelada";
    default:
      return estado;
  }
}

export function getTipoTareaOperativaLabel(tipo: TipoTareaOperativa): string {
  switch (tipo) {
    case "LLEVAR_LAVANDERIA":
      return "Envío a lavandería";
    case "LLEVAR_MODISTA":
      return "Envío a modista";
    case "CONTACTAR_MEDICION":
      return "Contactar medicion";
    default:
      return tipo;
  }
}
