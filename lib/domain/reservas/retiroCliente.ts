import type { Reserva, TareaOperativa } from "@/lib/domain/reservas/types";

/** Saco y pantalón (si aplica) en tienda: condición para habilitar retiro en el local. */
export function prendasEnTiendaParaRetiroCliente(reserva: Reserva): boolean {
  if (reserva.saco.ubicacionActual !== "TIENDA") return false;
  if (reserva.pantalon && reserva.pantalon.ubicacionActual !== "TIENDA") return false;
  return true;
}

/**
 * Tareas aún no cerradas (pendiente o en proceso) para la reserva.
 * Se usa para advertir antes de un retiro excepcional.
 */
export function reservaTieneTareasOperativasAbiertas(
  tareas: TareaOperativa[],
  reservaId: number,
): boolean {
  return tareas.some(
    (t) =>
      t.reserva?.id === reservaId &&
      t.estado !== "COMPLETADA" &&
      t.estado !== "CANCELADA",
  );
}
