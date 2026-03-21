import { BloqueoPrenda, DiaNoLaborable, TipoBloqueo } from "@/lib/domain/reservas/types";
import { getTipoBloqueoLabel } from "@/lib/domain/reservas/labels";
import { eachDayOfInterval, format, getDay, parseISO } from "date-fns";

export type EstadoDiaCalendario = "DISPONIBLE" | "BLOQUEADO" | "NO_LABORABLE";

export interface CalendarDayModel {
  day: Date;
  dayKey: string;
  dayNumber: number;
  estado: EstadoDiaCalendario;
  disabled: boolean;
  bloqueosDelDia: BloqueoPrenda[];
  bloqueosActivosDelDia: BloqueoPrenda[];
  tiposBloqueoActivos: TipoBloqueo[];
  isToday: boolean;
  isSunday: boolean;
  isHoliday: boolean;
  isPast: boolean;
}

export function toDayKey(day: Date): string {
  return format(day, "yyyy-MM-dd");
}

export function getBloqueoLabel(tipo: TipoBloqueo): string {
  return getTipoBloqueoLabel(tipo);
}

export function buildBloqueosByDayMap(
  bloqueos: BloqueoPrenda[],
): Record<string, BloqueoPrenda[]> {
  const map: Record<string, BloqueoPrenda[]> = {};

  for (const bloqueo of bloqueos) {
    const inicio = parseISO(bloqueo.inicio);
    const fin = parseISO(bloqueo.fin);
    const intervalo = eachDayOfInterval({ start: inicio, end: fin });

    for (const day of intervalo) {
      const dayKey = toDayKey(day);
      if (!map[dayKey]) {
        map[dayKey] = [];
      }
      map[dayKey].push(bloqueo);
    }
  }

  return map;
}

export function getHolidaySet(diasNoLaborables: DiaNoLaborable[]): Set<string> {
  return new Set(
    diasNoLaborables
      .filter((item) => item.tipo === "FERIADO")
      .map((item) => item.fecha),
  );
}

export function buildCalendarDayModel(args: {
  day: Date;
  bloqueosByDay: Record<string, BloqueoPrenda[]>;
  holidaySet: Set<string>;
  todayKey: string;
}): CalendarDayModel {
  const dayKey = toDayKey(args.day);
  const bloqueosDelDia = args.bloqueosByDay[dayKey] ?? [];
  const bloqueosActivosDelDia = bloqueosDelDia.filter(
    (bloqueo) => bloqueo.estado === "ACTIVO",
  );
  const tiposBloqueoActivos = Array.from(
    new Set(bloqueosActivosDelDia.map((bloqueo) => bloqueo.tipoBloqueo)),
  );

  const isSunday = getDay(args.day) === 0;
  const isHoliday = args.holidaySet.has(dayKey);
  const isNonWorking = isSunday || isHoliday;
  const isPast = dayKey < args.todayKey;

  let estado: EstadoDiaCalendario = "DISPONIBLE";
  if (isNonWorking) estado = "NO_LABORABLE";
  else if (bloqueosActivosDelDia.length > 0) estado = "BLOQUEADO";

  return {
    day: args.day,
    dayKey,
    dayNumber: Number(format(args.day, "d")),
    estado,
    disabled: estado === "NO_LABORABLE" || (isPast && estado === "DISPONIBLE"),
    bloqueosDelDia,
    bloqueosActivosDelDia,
    tiposBloqueoActivos,
    isToday: dayKey === args.todayKey,
    isSunday,
    isHoliday,
    isPast,
  };
}
