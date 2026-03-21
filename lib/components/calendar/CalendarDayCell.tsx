"use client";

import {
  CalendarDayModel,
  getBloqueoLabel,
} from "@/lib/domain/calendar/calendar-utils";
import { TipoBloqueo } from "@/lib/domain/reservas/types";

type CalendarDayCellProps = {
  model: CalendarDayModel;
  onPress: (model: CalendarDayModel) => void;
};

const STATE_CLASS: Record<CalendarDayModel["estado"], string> = {
  DISPONIBLE:
    "bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100",
  BLOQUEADO: "bg-zinc-50 border-zinc-300 text-zinc-900 hover:bg-zinc-100",
  NO_LABORABLE: "bg-zinc-100 border-zinc-300 text-zinc-600 cursor-not-allowed",
};

const BLOQUEO_BADGE_CLASS: Record<TipoBloqueo, string> = {
  MEDICION: "bg-orange-100 border border-orange-300 text-orange-800",
  RESERVA: "bg-rose-100 border border-rose-300 text-rose-800",
  MODISTA: "bg-violet-100 border border-violet-300 text-violet-800",
  LISTO_TIENDA: "bg-indigo-100 border border-indigo-300 text-indigo-800",
  LAVANDERIA: "bg-sky-100 border border-sky-300 text-sky-800",
  MANUAL: "bg-amber-100 border border-amber-300 text-amber-800",
  MANTENIMIENTO: "bg-amber-100 border border-amber-300 text-amber-800",
};

const BLOQUEO_CELL_CLASS: Record<TipoBloqueo, string> = {
  MEDICION: "bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-100",
  RESERVA: "bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100",
  MODISTA: "bg-violet-50 border-violet-200 text-violet-900 hover:bg-violet-100",
  LISTO_TIENDA: "bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100",
  LAVANDERIA: "bg-sky-50 border-sky-200 text-sky-900 hover:bg-sky-100",
  MANUAL: "bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100",
  MANTENIMIENTO: "bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100",
};

export function CalendarDayCell({ model, onPress }: CalendarDayCellProps) {
  const labelBadges: { label: string; className: string }[] =
    model.estado === "NO_LABORABLE"
      ? [
          {
            label: model.isHoliday ? "Feriado" : "Domingo",
            className: "bg-zinc-200 border border-zinc-300 text-zinc-700",
          },
        ]
      : model.tiposBloqueoActivos.map((tipo) => ({
          label: getBloqueoLabel(tipo),
          className: BLOQUEO_BADGE_CLASS[tipo],
        }));

  const singleTipoBloqueo =
    model.estado === "BLOQUEADO" && model.tiposBloqueoActivos.length === 1
      ? model.tiposBloqueoActivos[0]
      : null;
  const cellClass =
    singleTipoBloqueo && model.estado === "BLOQUEADO"
      ? BLOQUEO_CELL_CLASS[singleTipoBloqueo]
      : STATE_CLASS[model.estado];

  const accessibilityDescription = `Dia ${model.dayNumber}. Estado ${model.estado}. ${
    labelBadges.length > 0
      ? `Etiquetas: ${labelBadges.map((item) => item.label).join(", ")}.`
      : ""
  } ${
    model.bloqueosActivosDelDia.length > 0
      ? `${model.bloqueosActivosDelDia.length} bloqueos activos.`
      : "Sin bloqueos activos."
  } ${model.isPast && model.estado === "DISPONIBLE" ? "Fecha pasada." : ""}`;

  return (
    <button
      type="button"
      disabled={model.disabled}
      onClick={() => onPress(model)}
      aria-label={accessibilityDescription}
      className={`relative h-24 md:h-28 w-full rounded-md border p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pastel-primary focus-visible:ring-offset-2 ${cellClass} ${
        model.isToday ? "ring-2 ring-pastel-primary ring-offset-1" : ""
      } ${model.isPast && model.estado === "DISPONIBLE" ? "opacity-55 cursor-not-allowed" : ""}`}
    >
      <span className="sr-only">{accessibilityDescription}</span>
      <div className="flex items-start justify-between">
        <span className="text-sm font-semibold">{model.dayNumber}</span>
        {model.bloqueosActivosDelDia.length > 1 && (
          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold">
            {model.bloqueosActivosDelDia.length}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {labelBadges.slice(0, 2).map((item) => (
          <span
            key={item.label}
            className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${item.className}`}
          >
            {item.label}
          </span>
        ))}
        {labelBadges.length > 2 && (
          <span className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-medium">
            +{labelBadges.length - 2}
          </span>
        )}
      </div>
    </button>
  );
}
