import type { TareaOperativa } from "@/lib/domain/reservas/types";
import { formatApiDateForUi } from "@/lib/utils/formatApiDate";

function formatMsgDate(s: string | null | undefined): string {
  if (s == null || s === "" || s === "-") return "-";
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? formatApiDateForUi(s) : s;
}

const TEMPLATE = `Estimado {{NOMBRE_CLIENTE}}, ¡buen día! 👋 Te hablamos de El Estribo por tu reserva del {{FECHA_EVENTO}}.

Te recordamos pasar por el local entre el {{FECHA_INICIO_MEDIDAS}} y el {{FECHA_FIN_MEDIDAS}} para tomar las medidas finales y dejar tu traje listo.

¡Te esperamos! Saludos, Equipo de El Estribo`;

/**
 * Mensaje predefinido para WhatsApp (contacto medición), con variables sustituidas.
 */
export function buildWhatsappContactoMedicionMessage(tarea: TareaOperativa): string {
  const nombre = tarea.clienteNombre ?? "cliente";
  const fechaReservaRaw = String((tarea.metadataJson?.fechaReserva as string) ?? "-");
  const fechaEvento = formatMsgDate(fechaReservaRaw === "-" ? null : fechaReservaRaw);
  const inicio = formatMsgDate(tarea.fechaObjetivoDesde);
  const fin = formatMsgDate(tarea.fechaObjetivoHasta);

  return TEMPLATE.replace("{{NOMBRE_CLIENTE}}", nombre)
    .replace("{{FECHA_EVENTO}}", fechaEvento)
    .replace("{{FECHA_INICIO_MEDIDAS}}", inicio)
    .replace("{{FECHA_FIN_MEDIDAS}}", fin);
}
