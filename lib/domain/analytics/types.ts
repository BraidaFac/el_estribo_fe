import type { MotivoRechazoPreEntrega } from "@/lib/domain/control-pre-entrega/types";

export type Granularidad = "SEMANA" | "MES";

export type BiQueryParams = {
  desde: string;
  hasta: string;
  granularidad: Granularidad;
};

export type BiEvolucionPunto = {
  periodo: string;
  totalReservas: number;
};

export type BiPreEntregaResumen = {
  total: number;
  aprobados: number;
  rechazados: number;
  porMotivo: Record<MotivoRechazoPreEntrega, number>;
};

export type BiDevolucionesResumen = {
  total: number;
  perfectasCondiciones: number;
  malasCondiciones: number;
  conCargoAdicional: number;
};

export type BiResponse = {
  generadoEn: string;
  filtros: BiQueryParams;
  evolucionReservas: BiEvolucionPunto[];
  preEntrega: BiPreEntregaResumen;
  devoluciones: BiDevolucionesResumen;
};
