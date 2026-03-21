"use client";

import { Reserva } from "@/lib/domain/reservas/types";
import { listarReservasRango } from "@/lib/services/v2";
import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth, startOfToday } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

export type ReservaDaySummary = {
  dayKey: string;
  cantidadReservas: number;
  cantidadSacos: number;
  cantidadPantalones: number;
  reservas: Reserva[];
};

type UseDiarioReservasArgs = {
  sacoId?: number | null;
};

export function useDiarioReservas({ sacoId = null }: UseDiarioReservasArgs = {}) {
  const [firstDayCurrentMonth, setFirstDayCurrentMonth] = useState<Date>(
    startOfMonth(startOfToday()),
  );
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monthStartKey = useMemo(
    () => format(firstDayCurrentMonth, "yyyy-MM-dd"),
    [firstDayCurrentMonth],
  );
  const monthEndKey = useMemo(
    () => format(endOfMonth(firstDayCurrentMonth), "yyyy-MM-dd"),
    [firstDayCurrentMonth],
  );
  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: firstDayCurrentMonth,
        end: endOfMonth(firstDayCurrentMonth),
      }),
    [firstDayCurrentMonth],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listarReservasRango(monthStartKey, monthEndKey, sacoId ?? undefined);
      setReservas(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar las reservas del mes",
      );
    } finally {
      setIsLoading(false);
    }
  }, [monthEndKey, monthStartKey, sacoId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const summaryByDay = useMemo<Record<string, ReservaDaySummary>>(() => {
    const map: Record<string, ReservaDaySummary> = {};

    for (const reserva of reservas) {
      const key = reserva.fechaReserva;
      if (!map[key]) {
        map[key] = {
          dayKey: key,
          cantidadReservas: 0,
          cantidadSacos: 0,
          cantidadPantalones: 0,
          reservas: [],
        };
      }
      map[key].cantidadReservas += 1;
      map[key].cantidadSacos += 1;
      map[key].cantidadPantalones += reserva.pantalon ? 1 : 0;
      map[key].reservas.push(reserva);
    }

    for (const key of Object.keys(map)) {
      map[key].reservas.sort((a, b) => a.id - b.id);
    }

    return map;
  }, [reservas]);

  const groupedDays = useMemo(
    () => Object.values(summaryByDay).sort((a, b) => a.dayKey.localeCompare(b.dayKey)),
    [summaryByDay],
  );

  const previousMonth = useCallback(() => {
    setFirstDayCurrentMonth((prev) => addMonths(prev, -1));
  }, []);

  const nextMonth = useCallback(() => {
    setFirstDayCurrentMonth((prev) => addMonths(prev, 1));
  }, []);

  return {
    firstDayCurrentMonth,
    monthLabel: format(firstDayCurrentMonth, "MMMM yyyy"),
    monthStartKey,
    monthEndKey,
    days,
    reservas,
    summaryByDay,
    groupedDays,
    isLoading,
    error,
    refresh,
    previousMonth,
    nextMonth,
  };
}
