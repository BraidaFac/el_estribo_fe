import type { EstadoControlPreEntrega } from "@/lib/domain/reservas/types";

export type { EstadoControlPreEntrega };

export type PlanillaPrepararFila = {
  reservaId: number;
  fechaReserva: string;
  clienteNombre: string;
  diasHastaReserva: number;
  tieneTareasPendientes: boolean;
  puedeIniciarPreEntrega: boolean;
};

export type RechazoPreEntregaFila = {
  id: number;
  reservaId: number;
  fechaReserva: string;
  clienteNombre: string;
  motivoRechazo: string | null;
  auditorNombre: string;
  estado: EstadoControlPreEntrega;
  createdAt: string;
};

export type CreateControlPreEntregaPayload = {
  reservaId: number;
  aromaScore: number;
  aromaObs?: string;
  planchadoScore: number;
  planchadoObs?: string;
  sastreriaScore: number;
  sastreriaObs?: string;
  higieneScore: number;
  higieneObs?: string;
  complementosScore: number;
  complementosObs?: string;
  estado: "APROBADO" | "RECHAZADO";
  motivoRechazo?: string;
  auditorNombre: string;
};

/** Registro persistido (lectura desde detalle operativo). */
export type ControlPreEntregaRecord = {
  id: number;
  aromaScore: number;
  aromaObs: string | null;
  planchadoScore: number;
  planchadoObs: string | null;
  sastreriaScore: number;
  sastreriaObs: string | null;
  higieneScore: number;
  higieneObs: string | null;
  complementosScore: number;
  complementosObs: string | null;
  estado: EstadoControlPreEntrega;
  motivoRechazo: string | null;
  auditorNombre: string;
  createdAt: string;
  fechaResolucion: string | null;
  resueltoPor: string | null;
};
