"use client";

import CalendarReservas from "@/lib/components/CalendarReservas";
import { DiarioReservasList } from "@/lib/components/diario/DiarioReservasList";
import { useDiarioReservas } from "@/lib/hooks/useDiarioReservas";
import { Button, Spinner } from "@heroui/react";
import { useState } from "react";

type DiarioView = "CALENDARIO" | "DIARIO";

export default function DiarioPage() {
  const [view, setView] = useState<DiarioView>("CALENDARIO");
  const {
    firstDayCurrentMonth,
    days,
    summaryByDay,
    groupedDays,
    monthLabel,
    isLoading,
    error,
    refresh,
    previousMonth,
    nextMonth,
  } = useDiarioReservas();

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="rounded-lg border border-pastel-border bg-pastel-surface p-4">
        <h1 className="text-2xl font-semibold text-pastel-text">Diario</h1>
        <p className="mt-1 text-sm text-pastel-text/80">
          Visualizar cantidad de reservas por día en el rango de fechas
          seleccionado.
        </p>
        <div className="mt-3 grid grid-cols-1 items-center gap-2 md:grid-cols-3">
          <div className="hidden md:block" />
          <div className="justify-self-center">
            <div className="inline-flex rounded-lg border border-pastel-border p-1">
              <Button
                size="sm"
                color={view === "CALENDARIO" ? "primary" : "default"}
                variant={view === "CALENDARIO" ? "solid" : "light"}
                onPress={() => setView("CALENDARIO")}
              >
                Vista Calendario
              </Button>
              <Button
                size="sm"
                color={view === "DIARIO" ? "primary" : "default"}
                variant={view === "DIARIO" ? "solid" : "light"}
                onPress={() => setView("DIARIO")}
              >
                Vista Diario
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 text-sm text-pastel-text/80">
            <span>{monthLabel}</span>
            <Button size="sm" variant="flat" onPress={refresh}>
              Refrescar
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-24 items-center justify-center">
          <Spinner color="secondary" />
        </div>
      ) : error ? (
        <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      ) : view === "CALENDARIO" ? (
        <CalendarReservas
          firstDayCurrentMonth={firstDayCurrentMonth}
          days={days}
          summaryByDay={summaryByDay}
          previousMonth={previousMonth}
          nextMonth={nextMonth}
          onDataChanged={refresh}
        />
      ) : (
        <DiarioReservasList groupedDays={groupedDays} />
      )}
    </div>
  );
}
