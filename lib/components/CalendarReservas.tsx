"use client";

import { ReservationActionsDialog } from "@/lib/components/reservas/ReservationActionsDialog";
import { Reserva } from "@/lib/domain/reservas/types";
import { ReservaDaySummary } from "@/lib/hooks/useDiarioReservas";
import { formatApiDateForUi } from "@/lib/utils/formatApiDate";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { format, getDay, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo, useState } from "react";

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatDayTitle(dayKey: string): string {
  const weekday = format(new Date(`${dayKey}T12:00:00`), "EEEE", {
    locale: es,
  });
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${cap}, ${formatApiDateForUi(dayKey)}`;
}

type CalendarReservasProps = {
  firstDayCurrentMonth: Date;
  days: Date[];
  summaryByDay: Record<string, ReservaDaySummary>;
  previousMonth: () => void;
  nextMonth: () => void;
  onDataChanged?: () => Promise<void> | void;
};

export default function CalendarReservas({
  firstDayCurrentMonth,
  days,
  summaryByDay,
  previousMonth,
  nextMonth,
  onDataChanged,
}: CalendarReservasProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const selectedReservas: Reserva[] = useMemo(() => {
    if (!selectedDay) return [];
    return summaryByDay[selectedDay]?.reservas ?? [];
  }, [selectedDay, summaryByDay]);

  const refreshAndNotify = async () => {
    if (!onDataChanged) return;
    await onDataChanged();
  };

  return (
    <div className="rounded-lg border border-pastel-border bg-pastel-surface p-4">
      <div className="flex items-center text-center">
        <button
          type="button"
          onClick={previousMonth}
          className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-600"
        >
          <ChevronLeftIcon className="h-8 w-8" aria-hidden="true" />
        </button>
        <h2 className="flex-auto text-2xl font-semibold capitalize text-pastel-text">
          {format(firstDayCurrentMonth, "MMMM yyyy", { locale: es })}
        </h2>
        <button
          onClick={nextMonth}
          type="button"
          className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-600"
        >
          <ChevronRightIcon className="h-8 w-8" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 text-center text-xs text-pastel-primary">
        <div>D</div>
        <div>L</div>
        <div>M</div>
        <div>M</div>
        <div>J</div>
        <div>V</div>
        <div>S</div>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {days.map((day, dayIdx) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayData = summaryByDay[dayKey];
          const cantidadSacos = dayData?.cantidadSacos ?? 0;
          const cantidadPantalones = dayData?.cantidadPantalones ?? 0;
          const hasBookings = cantidadSacos > 0 || cantidadPantalones > 0;

          return (
            <div
              key={dayKey}
              className={classNames(
                dayIdx === 0 && colStartClasses[getDay(firstDayCurrentMonth)],
                "relative h-24 w-full rounded-md border border-pastel-border md:h-28",
              )}
            >
              <button
                onClick={() => setSelectedDay(dayKey)}
                type="button"
                className={classNames(
                  "h-full w-full rounded-md p-2 text-left transition-colors ",
                  hasBookings && "bg-pastel-secondary/50",
                  isToday(day) && !hasBookings
                    ? "bg-pastel-primary/85 text-white"
                    : "bg-pastel-soft",
                )}
              >
                <span className="text-xs font-semibold">
                  {format(day, "d")}
                </span>
                <div className="mt-2 flex flex-row justify-center items-center gap-2 text-[10px] md:text-xs">
                  <div
                    className={classNames(
                      "inline-flex rounded px-1.5 py-0.5",
                      cantidadSacos > 0
                        ? "bg-rose-100 text-rose-800"
                        : "bg-white/50 text-pastel-text/80",
                    )}
                  >
                    S: {cantidadSacos}
                  </div>
                  <div
                    className={classNames(
                      "inline-flex rounded px-1.5 py-0.5",
                      cantidadPantalones > 0
                        ? "bg-sky-300 text-sky-800"
                        : "bg-white/50 text-pastel-text/80",
                    )}
                  >
                    P: {cantidadPantalones}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <ReservationActionsDialog
        isOpen={!!selectedDay}
        onOpenChange={(open) => {
          if (!open) setSelectedDay(null);
        }}
        title={`Reservas del día ${selectedDay ? formatDayTitle(selectedDay) : ""}`}
        reservas={selectedReservas}
        onDataChanged={refreshAndNotify}
      />
    </div>
  );
}

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];
