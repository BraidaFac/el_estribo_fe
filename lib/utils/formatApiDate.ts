import { parseDate } from "@internationalized/date";
import { APP_LOCALE, APP_TIME_ZONE } from "@/lib/i18n/appLocale";

let dateOnlyFormatter: Intl.DateTimeFormat | null = null;

function getDateOnlyFormatter(): Intl.DateTimeFormat {
  if (!dateOnlyFormatter) {
    dateOnlyFormatter = new Intl.DateTimeFormat(APP_LOCALE, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  }
  return dateOnlyFormatter;
}

/**
 * Convierte fecha solo-día del API (`yyyy-MM-dd` o prefijo ISO) a texto para la UI.
 * Usa el mismo locale que `HeroUIProvider` (APP_LOCALE).
 */
export function formatApiDateForUi(value: string | null | undefined): string {
  if (value == null || value.trim() === "") return "-";
  const trimmed = value.trim();
  const datePart = trimmed.length >= 10 ? trimmed.slice(0, 10) : trimmed;
  try {
    const cal = parseDate(datePart);
    return getDateOnlyFormatter().format(cal.toDate("UTC"));
  } catch {
    return trimmed;
  }
}

/**
 * Fecha y hora ISO del API → `dd/MM/yyyy, HH:mm`.
 * El backend guarda timestamps sin indicador de zona (hora de sistema del servidor).
 * Se normaliza siempre a UTC para que la hora mostrada sea exactamente la almacenada,
 * sin importar el timezone del navegador.
 */
export function formatApiDateTimeForUi(value: string | null | undefined): string {
  if (value == null || value.trim() === "") return "-";
  let normalized = value.trim();
  // normalizar separador MySQL: "2026-04-12 09:50:43" → "2026-04-12T09:50:43"
  if (normalized.includes(" ") && !normalized.includes("T")) {
    normalized = normalized.replace(" ", "T");
  }
  // agregar Z si no hay indicador de timezone
  const hasOffset =
    normalized.endsWith("Z") ||
    normalized.indexOf("+", 10) !== -1 ||
    normalized.indexOf("-", 10) !== -1;
  if (!hasOffset) {
    normalized += "Z";
  }
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(APP_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: APP_TIME_ZONE,
  }).format(d);
}

const ISO_DATE_IN_TEXT = /\d{4}-\d{2}-\d{2}/g;

/**
 * Reemplaza fechas `yyyy-MM-dd` incrustadas en textos del API (toasts, mensajes de error).
 */
export function formatIsoDatesInText(text: string): string {
  return text.replace(ISO_DATE_IN_TEXT, (ymd) => formatApiDateForUi(ymd));
}
