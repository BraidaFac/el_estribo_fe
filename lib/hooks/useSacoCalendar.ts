"use client";

import {
  buildBloqueosByDayMap,
  buildCalendarDayModel,
  CalendarDayModel,
  getHolidaySet,
  toDayKey,
} from "@/lib/domain/calendar/calendar-utils";
import { BloqueoPrenda, DiaNoLaborable } from "@/lib/domain/reservas/types";
import { listarBloqueosPorPrenda, listarDiasNoLaborables } from "@/lib/services/v2";
import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth, startOfToday } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseSacoCalendarParams = {
  sacoId: number | null;
  diasNoLaborables?: DiaNoLaborable[];
  refreshKey?: number;
};

type UseSacoCalendarResult = {
  firstDayCurrentMonth: Date;
  monthLabel: string;
  dayModels: CalendarDayModel[];
  isLoading: boolean;
  error: string | null;
  bloqueos: BloqueoPrenda[];
  lastUpdatedAt: Date | null;
  refresh: () => Promise<void>;
  previousMonth: () => void;
  nextMonth: () => void;
};

export function useSacoCalendar({
  sacoId,
  diasNoLaborables: diasNoLaborablesExtra = [],
  refreshKey,
}: UseSacoCalendarParams): UseSacoCalendarResult {
  const [firstDayCurrentMonth, setFirstDayCurrentMonth] = useState<Date>(
    startOfMonth(startOfToday()),
  );
  const [bloqueos, setBloqueos] = useState<BloqueoPrenda[]>([]);
  const [diasNoLaborablesBackend, setDiasNoLaborablesBackend] = useState<
    DiaNoLaborable[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

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
    if (!sacoId) {
      setBloqueos([]);
      setDiasNoLaborablesBackend([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [bloqueosData, diasNoLaborablesData] = await Promise.all([
        listarBloqueosPorPrenda("SACO", sacoId, monthStartKey, monthEndKey),
        listarDiasNoLaborables(monthStartKey, monthEndKey),
      ]);
      setBloqueos(bloqueosData);
      setDiasNoLaborablesBackend(diasNoLaborablesData);
      setLastUpdatedAt(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los bloqueos del saco",
      );
    } finally {
      setIsLoading(false);
    }
  }, [monthEndKey, monthStartKey, sacoId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!refreshKey) return;
    refresh();
  }, [refresh, refreshKey]);

  const bloqueosByDay = useMemo(() => buildBloqueosByDayMap(bloqueos), [bloqueos]);
  const holidaySet = useMemo(
    () => getHolidaySet([...diasNoLaborablesBackend, ...diasNoLaborablesExtra]),
    [diasNoLaborablesBackend, diasNoLaborablesExtra],
  );
  const todayKey = useMemo(() => toDayKey(startOfToday()), []);

  const dayModels = useMemo(
    () =>
      days.map((day) =>
        buildCalendarDayModel({
          day,
          bloqueosByDay,
          holidaySet,
          todayKey,
        }),
      ),
    [bloqueosByDay, days, holidaySet, todayKey],
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
    dayModels,
    isLoading,
    error,
    bloqueos,
    lastUpdatedAt,
    refresh,
    previousMonth,
    nextMonth,
  };
}
