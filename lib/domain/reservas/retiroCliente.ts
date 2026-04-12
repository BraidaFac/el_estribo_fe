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

/**
 * True si la prenda directa de la tarea (LLEVAR_LAVANDERIA / LLEVAR_MODISTA) está en tienda.
 * Usa tarea.saco o tarea.pantalon según tipoPrenda.
 */
export function tareaConPrendaEnTienda(tarea: TareaOperativa): boolean {
  if (tarea.tipoPrenda === "SACO") return tarea.saco?.ubicacionActual === "TIENDA";
  if (tarea.tipoPrenda === "PANTALON") return tarea.pantalon?.ubicacionActual === "TIENDA";
  return false;
}

/**
 * True si el saco de la reserva vinculada a la tarea está en tienda.
 * Para tareas CONTACTAR_MEDICION (requiere join reserva.saco en el backend).
 */
export function sacoReservaEnTienda(tarea: TareaOperativa): boolean {
  return tarea.reserva?.saco?.ubicacionActual === "TIENDA";
}
