"use client";

import { CalendarDayModel } from "@/lib/domain/calendar/calendar-utils";
import { DiaNoLaborable } from "@/lib/domain/reservas/types";
import { useSacoCalendar } from "@/lib/hooks/useSacoCalendar";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { Button, Spinner } from "@heroui/react";
import { getDay } from "date-fns";
import { CalendarDayCell } from "./CalendarDayCell";
import { CalendarLegend } from "./CalendarLegend";

type SacoCalendarProps = {
  sacoId: number | null;
  diasNoLaborables?: DiaNoLaborable[];
  refreshKey?: number;
  onSelectAvailableDay?: (model: CalendarDayModel) => void | Promise<void>;
  onSelectBlockedDay?: (model: CalendarDayModel) => void | Promise<void>;
  onSelectNonWorkingDay?: (model: CalendarDayModel) => void | Promise<void>;
};

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];

export function SacoCalendar({
  sacoId,
  diasNoLaborables = [],
  refreshKey,
  onSelectAvailableDay,
  onSelectBlockedDay,
  onSelectNonWorkingDay,
}: SacoCalendarProps) {
  const {
    firstDayCurrentMonth,
    monthLabel,
    dayModels,
    isLoading,
    error,
    lastUpdatedAt,
    refresh,
    previousMonth,
    nextMonth,
  } = useSacoCalendar({ sacoId, diasNoLaborables, refreshKey });

  const handleDayClick = (model: CalendarDayModel) => {
    if (model.estado === "DISPONIBLE") {
      void onSelectAvailableDay?.(model);
      return;
    }
    if (model.estado === "BLOQUEADO") {
      void onSelectBlockedDay?.(model);
      return;
    }
    void onSelectNonWorkingDay?.(model);
  };

  if (!sacoId) {
    return (
      <div className="rounded-lg border border-pastel-border bg-pastel-surface p-5 text-center text-pastel-text">
        Selecciona un saco para ver su calendario operativo.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-pastel-border bg-pastel-surface p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={previousMonth}
          className="rounded-md p-1 text-gray-400 hover:text-gray-600"
        >
          <ChevronLeftIcon className="h-7 w-7" />
        </button>
        <h2 className="text-xl font-semibold capitalize text-pastel-text">
          {monthLabel}
        </h2>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-md p-1 text-gray-400 hover:text-gray-600"
        >
          <ChevronRightIcon className="h-7 w-7" />
        </button>
      </div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded border border-pastel-border bg-pastel-soft p-2 text-xs text-pastel-text/90">
        <span className="sr-only" aria-live="polite">
          {isLoading
            ? "Calendario cargando"
            : error
              ? "Calendario con error"
              : "Calendario actualizado"}
        </span>
        <span>
          Estado: {isLoading ? "Cargando" : error ? "Con errores" : "Sincronizado"}
        </span>
        <span>
          Ultima actualizacion:{" "}
          {lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString() : "-"}
        </span>
      </div>

      <div className="mb-3">
        <CalendarLegend />
      </div>

      {error && (
        <div className="mb-3 flex items-center justify-between rounded border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
          <span>{error}</span>
          <Button size="sm" color="danger" variant="flat" onPress={refresh}>
            Reintentar
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner color="secondary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-pastel-primary">
            <div>D</div>
            <div>L</div>
            <div>M</div>
            <div>M</div>
            <div>J</div>
            <div>V</div>
            <div>S</div>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {dayModels.map((model, dayIdx) => (
              <div
                key={model.dayKey}
                className={dayIdx === 0 ? colStartClasses[getDay(firstDayCurrentMonth)] : ""}
              >
                <CalendarDayCell model={model} onPress={handleDayClick} />
              </div>
            ))}
          </div>
          {!error && dayModels.every((day) => day.bloqueosActivosDelDia.length === 0) && (
            <p className="mt-3 rounded border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">
              No hay bloqueos activos en este mes para el saco seleccionado.
            </p>
          )}
        </>
      )}
    </div>
  );
}
