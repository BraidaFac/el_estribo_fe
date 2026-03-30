import type { ControlPreEntregaRecord } from "@/lib/domain/control-pre-entrega/types";
import type { RecepcionDevolucionPayload } from "@/lib/domain/reservas/recepcionDevolucion";
import type { Reserva } from "@/lib/domain/reservas/types";

export type TrazabilidadEvento = {
  id: string;
  categoria:
    | "reserva"
    | "tarea"
    | "movimiento"
    | "agenda"
    | "control_pre_entrega"
    | "cliente";
  titulo: string;
  descripcion: string | null;
  fecha: string | null;
};

export type AccionesReservaDetalle = {
  editar: { permitida: boolean; motivo: string | null };
  cancelar: { permitida: boolean; motivo: string | null };
  retirar: { permitida: boolean; motivo: string | null };
  devolver: { permitida: boolean; motivo: string | null };
};

/** Registro persistido; los montos pueden llegar como string desde el API (decimal). */
export type RecepcionDevolucionRegistro = Omit<
  RecepcionDevolucionPayload,
  "botonesCierresCobro" | "ruedosTelasCobro" | "danoGraveCobro"
> & {
  id: number;
  fechaDevolucion: string;
  createdAt: string;
  botonesCierresCobro?: number | string | null;
  ruedosTelasCobro?: number | string | null;
  danoGraveCobro?: number | string | null;
};

export type ReservaDetalleOperativo = {
  reserva: Reserva & { accionesPermitidas: AccionesReservaDetalle };
  controlPreEntrega: ControlPreEntregaRecord | null;
  recepcionDevolucion: RecepcionDevolucionRegistro | null;
  trazabilidad: TrazabilidadEvento[];
};

export type HistorialReservasResponse = {
  items: (Reserva & { accionesPermitidas: AccionesReservaDetalle })[];
  total: number;
  page: number;
  limit: number;
};
