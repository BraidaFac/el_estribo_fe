import type { AgendaMedicion, Reserva, TareaOperativa } from "@/lib/domain/reservas/types";

export type DashboardUrgencia =
  | "VENCIDA"
  | "HOY"
  | "PROXIMA"
  | "FUTURA"
  | "SIN_FECHA";

export type DashboardCategoria =
  | "llevar_lavanderia"
  | "retirar_lavanderia"
  | "llevar_modista"
  | "retirar_modista"
  | "contactar_medicion"
  | "retiro_cliente"
  | "devolucion_cliente"
  | "agenda_medicion";

export type DashboardItem = {
  id: string;
  categoria: DashboardCategoria;
  titulo: string;
  descripcion: string | null;
  fechaReferencia: string | null;
  urgencia: DashboardUrgencia;
  prioridad: string | null;
  planillaDestino: string;
  tareaId?: number;
  reservaId?: number | null;
  agendaId?: number | null;
  tarea?: TareaOperativa;
  reserva?: Reserva & {
    accionesPermitidas: {
      editar: { permitida: boolean; motivo: string | null };
      cancelar: { permitida: boolean; motivo: string | null };
      retirar: { permitida: boolean; motivo: string | null };
      devolver: { permitida: boolean; motivo: string | null };
    };
  };
  agenda?: AgendaMedicion;
};

export type ReservaConAccionesView = Reserva & {
  accionesPermitidas: {
    editar: { permitida: boolean; motivo: string | null };
    cancelar: { permitida: boolean; motivo: string | null };
    retirar: { permitida: boolean; motivo: string | null };
    devolver: { permitida: boolean; motivo: string | null };
  };
};

export type DashboardOperativoResponse = {
  generadoEn: string;
  resumen: {
    vencidas: number;
    hoy: number;
    proximas: number;
    futuras: number;
    sinFecha: number;
    total: number;
  };
  porCategoria: Record<string, number>;
  items: DashboardItem[];
  /** Reservas con fecha en los próximos 7 días (hoy inclusive + 6). */
  proximasReservas7Dias: ReservaConAccionesView[];
};
