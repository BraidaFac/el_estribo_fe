import type { Lavanderia, Modista, Reserva, TipoPrenda } from "./types";

/** Fila de asignación por reserva + tipo de prenda (lavandería/modista operativos). */
export function asignacionParaTipo(
  reserva: Reserva | null | undefined,
  tipo: TipoPrenda,
) {
  return reserva?.asignacionesServicio?.find((a) => a.tipoPrenda === tipo);
}

export function nombreLavanderiaPorTipo(
  reserva: Reserva | null | undefined,
  tipo: TipoPrenda,
): string {
  return asignacionParaTipo(reserva, tipo)?.lavanderia?.nombre?.trim() ?? "—";
}

export function nombreModistaPorTipo(
  reserva: Reserva | null | undefined,
  tipo: TipoPrenda,
): string {
  return asignacionParaTipo(reserva, tipo)?.modista?.nombre?.trim() ?? "—";
}

/** Texto compacto para columnas de planilla (puede listar saco y pantalón). */
export function resumenLavanderiasReserva(reserva: Reserva | null | undefined): string {
  const s = nombreLavanderiaPorTipo(reserva, "SACO");
  const p = nombreLavanderiaPorTipo(reserva, "PANTALON");
  const lineas: string[] = [];
  if (s !== "—") lineas.push(`Saco: ${s}`);
  if (p !== "—") lineas.push(`Pantalón: ${p}`);
  return lineas.length ? lineas.join("\n") : "—";
}

export function resumenModistasReserva(reserva: Reserva | null | undefined): string {
  const s = nombreModistaPorTipo(reserva, "SACO");
  const p = nombreModistaPorTipo(reserva, "PANTALON");
  const lineas: string[] = [];
  if (s !== "—") lineas.push(`Saco: ${s}`);
  if (p !== "—") lineas.push(`Pantalón: ${p}`);
  return lineas.length ? lineas.join("\n") : "—";
}

/** Detalle extendido (nombre + tel + dir) para una fila de asignación. */
export function formatEntidadServicio(ent: Lavanderia | Modista | null | undefined): string {
  if (!ent) return "—";
  const partes = [
    ent.nombre?.trim() || null,
    ent.telefono?.trim() ? `Tel. ${ent.telefono.trim()}` : null,
    ent.direccion?.trim() ? `Dir. ${ent.direccion.trim()}` : null,
  ].filter(Boolean);
  return partes.length > 0 ? partes.join(" · ") : "—";
}

export function resumenLavanderiasReservaDetalle(
  reserva: Reserva | null | undefined,
): string[] {
  const aSaco = asignacionParaTipo(reserva, "SACO")?.lavanderia;
  const aPant = asignacionParaTipo(reserva, "PANTALON")?.lavanderia;
  const lineas: string[] = [];
  if (aSaco) lineas.push(`Saco: ${formatEntidadServicio(aSaco)}`);
  if (aPant) lineas.push(`Pantalón: ${formatEntidadServicio(aPant)}`);
  return lineas.length ? lineas : ["—"];
}

export function resumenModistasReservaDetalle(
  reserva: Reserva | null | undefined,
): string[] {
  const aSaco =   asignacionParaTipo(reserva, "SACO")?.modista;
  const aPant = asignacionParaTipo(reserva, "PANTALON")?.modista;
  const lineas: string[] = [];
  if (aSaco) lineas.push(`Saco: ${formatEntidadServicio(aSaco)}`);
  if (aPant) lineas.push(`Pantalón: ${formatEntidadServicio(aPant)}`);
  return lineas.length ? lineas : ["—"];
}
