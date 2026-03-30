import type { DashboardOperativoResponse } from "@/lib/domain/dashboard/types";
import type { RecepcionDevolucionPayload } from "@/lib/domain/reservas/recepcionDevolucion";
import type {
  HistorialReservasResponse,
  ReservaDetalleOperativo,
} from "@/lib/domain/reservas/seguimientoReservas";
import {
  CreateReservaV2Payload,
  Disponibilidad,
  MedicionesReservaJson,
  MedicionesReservaResponse,
  PantalonesDisponibles,
  Reserva,
  UpdateReservaV2Payload,
  ValidarReservaV2Payload,
} from "@/lib/domain/reservas/types";
import { apiFetch } from "@/lib/services/http";
import { buildQueryString } from "./query-string";

export async function disponibilidadSaco(
  sacoId: number,
  desde: string,
  hasta: string,
): Promise<Disponibilidad> {
  return apiFetch<Disponibilidad>(
    `/v2/reservas/disponibilidad/sacos/${sacoId}${buildQueryString({ desde, hasta })}`,
  );
}

export async function listarReservasRango(
  desde: string,
  hasta: string,
  sacoId?: number | null,
): Promise<Reserva[]> {
  return apiFetch<Reserva[]>(
    `/v2/reservas${buildQueryString({
      desde,
      hasta,
      sacoId: sacoId ?? undefined,
    })}`,
  );
}

export async function fetchDashboardOperativo(): Promise<DashboardOperativoResponse> {
  return apiFetch<DashboardOperativoResponse>("/v2/reservas/dashboard-operativo");
}

export async function pantalonesDisponibles(
  fecha: string,
): Promise<PantalonesDisponibles> {
  return apiFetch<PantalonesDisponibles>(
    `/v2/reservas/disponibilidad/pantalones${buildQueryString({ fecha })}`,
  );
}

export async function validarReservaV2(
  payload: ValidarReservaV2Payload,
): Promise<{ valid: true }> {
  return apiFetch<{ valid: true }>("/v2/reservas/validar", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function crearReservaV2(
  payload: CreateReservaV2Payload,
): Promise<Reserva> {
  return apiFetch<Reserva>("/v2/reservas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function actualizarReservaV2(
  reservaId: number,
  payload: UpdateReservaV2Payload,
): Promise<Reserva> {
  return apiFetch<Reserva>(`/v2/reservas/${reservaId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function marcarReservaRetirada(
  reservaId: number,
  motivo?: string,
): Promise<Reserva> {
  return apiFetch<Reserva>(`/v2/reservas/${reservaId}/retirar`, {
    method: "POST",
    body: JSON.stringify({ motivo }),
  });
}

export async function marcarReservaDevuelta(
  reservaId: number,
  payload: { recepcion: RecepcionDevolucionPayload; motivo?: string },
): Promise<Reserva> {
  return apiFetch<Reserva>(`/v2/reservas/${reservaId}/devolver`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Filtro opcional del historial: un solo texto (query `buscar`). */
export type HistorialReservasFiltros = {
  buscar?: string;
};

export async function listarHistorialReservas(
  page = 1,
  limit = 30,
  filtros?: HistorialReservasFiltros,
): Promise<HistorialReservasResponse> {
  return apiFetch<HistorialReservasResponse>(
    `/v2/reservas/historial${buildQueryString({
      page,
      limit,
      buscar: filtros?.buscar,
    })}`,
  );
}

export async function obtenerDetalleOperativoReserva(
  reservaId: number,
): Promise<ReservaDetalleOperativo> {
  return apiFetch<ReservaDetalleOperativo>(
    `/v2/reservas/${reservaId}/detalle-operativo`,
  );
}

export async function cancelarReservaV2(
  reservaId: number,
  motivo?: string,
): Promise<Reserva> {
  return apiFetch<Reserva>(`/v2/reservas/${reservaId}/cancelar`, {
    method: "POST",
    body: JSON.stringify({ motivo }),
  });
}

export async function obtenerMedicionesReserva(
  reservaId: number,
): Promise<MedicionesReservaResponse> {
  return apiFetch<MedicionesReservaResponse>(`/v2/reservas/${reservaId}/mediciones`);
}

export async function guardarMedicionesReserva(
  reservaId: number,
  payload: { saco?: Partial<MedicionesReservaJson["saco"]>; pantalon?: Partial<MedicionesReservaJson["pantalon"]> },
): Promise<MedicionesReservaResponse> {
  return apiFetch<MedicionesReservaResponse>(`/v2/reservas/${reservaId}/mediciones`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
