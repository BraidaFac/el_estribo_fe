import {
  AgendaMedicion,
  EstadoAgendaMedicion,
  EstadoTareaOperativa,
  TareaOperativa,
  TipoTareaOperativa,
} from "@/lib/domain/reservas/types";
import { apiFetch } from "@/lib/services/http";
import { buildQueryString } from "./query-string";

export async function listarTareasOperativas(params?: {
  tipoTarea?: TipoTareaOperativa;
  estado?: EstadoTareaOperativa;
  /** IDs de reserva separados por coma. */
  reservaIds?: string;
}): Promise<TareaOperativa[]> {
  return apiFetch<TareaOperativa[]>(
    `/v2/tareas-operativas${buildQueryString({
      tipoTarea: params?.tipoTarea,
      estado: params?.estado,
      reservaIds: params?.reservaIds,
    })}`,
  );
}

export async function actualizarEstadoTareaOperativa(
  tareaId: number,
  estado: EstadoTareaOperativa,
  motivo?: string,
): Promise<TareaOperativa> {
  return apiFetch<TareaOperativa>(`/v2/tareas-operativas/${tareaId}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ estado, motivo }),
  });
}

export async function marcarEnviadoLavanderia(
  tareaId: number,
  motivo?: string,
): Promise<TareaOperativa> {
  return apiFetch<TareaOperativa>(
    `/v2/tareas-operativas/${tareaId}/enviar-lavanderia`,
    {
      method: "POST",
      body: JSON.stringify({ motivo }),
    },
  );
}

export type EnviarLavanderiaReservaPayload = {
  sacoVaALavanderia: boolean;
  sacoLavanderiaId?: number;
  pantalonVaALavanderia?: boolean;
  pantalonLavanderiaId?: number;
  usuarioId?: string;
};

export async function registrarEnvioLavanderiaPorReserva(
  reservaId: number,
  payload: EnviarLavanderiaReservaPayload,
): Promise<void> {
  await apiFetch<void>(`/v2/tareas-operativas/reservas/${reservaId}/enviar-lavanderia`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function registrarRecibirLavanderiaPorReserva(
  reservaId: number,
  payload?: { usuarioId?: string; motivo?: string },
): Promise<void> {
  await apiFetch<void>(`/v2/tareas-operativas/reservas/${reservaId}/recibir-lavanderia`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export type EnviarModistaReservaPayload = {
  sacoVaAModista: boolean;
  sacoModistaId?: number;
  pantalonVaAModista?: boolean;
  pantalonModistaId?: number;
  usuarioId?: string;
};

export async function registrarEnvioModistaPorReserva(
  reservaId: number,
  payload: EnviarModistaReservaPayload,
): Promise<void> {
  await apiFetch<void>(`/v2/tareas-operativas/reservas/${reservaId}/enviar-modista`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function registrarRecibirModistaPorReserva(
  reservaId: number,
  payload?: { usuarioId?: string; motivo?: string },
): Promise<void> {
  await apiFetch<void>(`/v2/tareas-operativas/reservas/${reservaId}/recibir-modista`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export async function marcarRecibidoLavanderia(
  tareaId: number,
  motivo?: string,
): Promise<TareaOperativa> {
  return apiFetch<TareaOperativa>(
    `/v2/tareas-operativas/${tareaId}/recibir-lavanderia`,
    {
      method: "POST",
      body: JSON.stringify({ motivo }),
    },
  );
}

export async function marcarEnviadoModista(
  tareaId: number,
  motivo?: string,
): Promise<TareaOperativa> {
  return apiFetch<TareaOperativa>(
    `/v2/tareas-operativas/${tareaId}/enviar-modista`,
    {
      method: "POST",
      body: JSON.stringify({ motivo }),
    },
  );
}

export async function marcarRecibidoModista(
  tareaId: number,
  motivo?: string,
): Promise<TareaOperativa> {
  return apiFetch<TareaOperativa>(
    `/v2/tareas-operativas/${tareaId}/recibir-modista`,
    {
      method: "POST",
      body: JSON.stringify({ motivo }),
    },
  );
}

export async function programarMedicion(
  tareaId: number,
  payload: {
    fechaHoraCita: string;
    observaciones?: string;
    noValidarFecha?: boolean;
  },
): Promise<AgendaMedicion> {
  return apiFetch<AgendaMedicion>(
    `/v2/tareas-operativas/${tareaId}/programar-medicion`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function listarAgendaMediciones(params?: {
  desde?: string;
  hasta?: string;
  /** Si es true, incluye todos los estados (ASISTIO, CANCELADA, etc.) en el rango. */
  incluirTodosLosEstados?: boolean;
}): Promise<AgendaMedicion[]> {
  return apiFetch<AgendaMedicion[]>(
    `/v2/tareas-operativas/agenda-mediciones${buildQueryString({
      desde: params?.desde,
      hasta: params?.hasta,
      incluirTodosLosEstados:
        params?.incluirTodosLosEstados === true ? "true" : undefined,
    })}`,
  );
}

export async function actualizarEstadoAgendaMedicion(
  agendaId: number,
  estado: EstadoAgendaMedicion,
  observaciones?: string,
): Promise<AgendaMedicion> {
  return apiFetch<AgendaMedicion>(
    `/v2/tareas-operativas/agenda-mediciones/${agendaId}/estado`,
    {
      method: "PATCH",
      body: JSON.stringify({ estado, observaciones }),
    },
  );
}

export async function marcarContactoMedicion(
  tareaId: number,
): Promise<TareaOperativa> {
  return apiFetch<TareaOperativa>(
    `/v2/tareas-operativas/${tareaId}/marcar-contacto-medicion`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
}
