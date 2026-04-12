import type { EstadoControlPreEntrega } from "@/lib/domain/reservas/types";

export type { EstadoControlPreEntrega };

export type MotivoRechazoPreEntrega =
  | "AROMA"
  | "PLANCHADO"
  | "SASTRERIA"
  | "HIGIENE"
  | "COMPLEMENTOS"
  | "OTRO";

export const MOTIVOS_RECHAZO_LABELS: Record<MotivoRechazoPreEntrega, string> = {
  AROMA: "Aroma",
  PLANCHADO: "Planchado",
  SASTRERIA: "Sastrería",
  HIGIENE: "Higiene",
  COMPLEMENTOS: "Complementos",
  OTRO: "Otro",
};

export const TODOS_LOS_MOTIVOS: MotivoRechazoPreEntrega[] = [
  "AROMA",
  "PLANCHADO",
  "SASTRERIA",
  "HIGIENE",
  "COMPLEMENTOS",
  "OTRO",
];

export type PlanillaPrepararFila = {
  reservaId: number;
  fechaReserva: string;
  clienteNombre: string;
  diasHastaReserva: number;
  tieneTareasPendientes: boolean;
  puedeIniciarPreEntrega: boolean;
  sacocodigo: string;
  pantalonCodigo: string | null;
};

export type RechazoPreEntregaFila = {
  id: number;
  reservaId: number;
  fechaReserva: string;
  clienteNombre: string;
  motivosRechazo: MotivoRechazoPreEntrega[] | null;
  creadoPorNombre: string | null;
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
  motivosRechazo?: MotivoRechazoPreEntrega[];
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
  motivosRechazo: MotivoRechazoPreEntrega[] | null;
  creadoPor: { id: string; name: string } | null;
  createdAt: string;
  fechaResolucion: string | null;
  resueltoPor: { id: string; name: string } | null;
};
