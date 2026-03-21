/**
 * Textos de UI para las planillas de operaciones (títulos, descripciones, vacíos).
 * Los valores `mode` son los que usa la lógica; no renombrar.
 */
export type PlanillaOperacionesMode =
  | "LLEVAR_LAVANDERIA"
  | "RETIRAR_LAVANDERIA"
  | "LLEVAR_MODISTA"
  | "RETIRAR_MODISTA"
  | "RETIROS_CLIENTES"
  | "DEVOLUCIONES_CLIENTES";

export type PlanillaOperacionesUi = {
  title: string;
  description: string;
  /** Tabla de tareas (Llevar / Retirar lavandería) */
  emptyTareas?: string;
  /** Tabla de reservas (Retiros / Devoluciones clientes) */
  emptyReservas?: string;
};

export const PLANILLA_OPERACIONES_UI: Record<PlanillaOperacionesMode, PlanillaOperacionesUi> = {
  LLEVAR_LAVANDERIA: {
    title: "Llevar Lavandería",
    description: "Listado de prendas que deben enviarse a lavandería.",
    emptyTareas: "No hay prendas pendientes de envío a lavandería para este filtro.",
  },
  RETIRAR_LAVANDERIA: {
    title: "Retirar Lavandería",
    description: "Listado de prendas que deben retirarse de la lavandería.",
    emptyTareas: "No hay prendas pendientes de recepción desde lavandería para este filtro.",
  },
  LLEVAR_MODISTA: {
    title: "Llevar a modista",
    description:
      "Una fila por reserva. Modal con misma modista u omisión por prenda; confirma envío y ubicación EN_MODISTA.",
    emptyTareas: "No hay prendas pendientes de envío a modista para este filtro.",
  },
  RETIRAR_MODISTA: {
    title: "Retirar de modista",
    description:
      "Agrupado por reserva: recibir todas las prendas en modista o una tarea suelta.",
    emptyTareas: "No hay prendas pendientes de recepción desde modista para este filtro.",
  },
  RETIROS_CLIENTES: {
    title: "Retiros Clientes",
    description: "Listado de prendas que los clientes deben retirar del local.",
    emptyReservas: "No hay reservas con retiro pendiente en el local para este filtro.",
  },
  DEVOLUCIONES_CLIENTES: {
    title: "Devoluciones Clientes",
    description: "Listado de prendas que los clientes deben devolver al local.",
    emptyReservas: "No hay devoluciones pendientes al local para este filtro.",
  },
};

export function planillaOperacionesDocumentTitle(mode: PlanillaOperacionesMode): string {
  return `${PLANILLA_OPERACIONES_UI[mode].title} · El Estribo`;
}
