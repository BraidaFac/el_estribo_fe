"use client";

import { listActiveBookingsFrom } from "@/lib/services/booking.service";
import { Booking } from "@/lib/utils/booking";
import { formatApiDate } from "@/lib/utils/dateOnly";
import { add, eachDayOfInterval, endOfMonth, format, parse, startOfToday } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";

type BookingsByDay = Record<string, { cantidad: number; reservas: Booking[] }>;

function toDisplayDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-");
  return `${day}/${month}/${year}`;
}

export function useCalendarReservas() {
  const [currentMonth, setCurrentMonth] = useState(format(startOfToday(), "MMM-yyyy"));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firstDayCurrentMonth = useMemo(
    () => parse(currentMonth, "MMM-yyyy", new Date()),
    [currentMonth],
  );

  const monthStartKey = useMemo(
    () => formatApiDate(firstDayCurrentMonth),
    [firstDayCurrentMonth],
  );

  const monthPrefix = useMemo(() => monthStartKey.slice(0, 7), [monthStartKey]);

  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: firstDayCurrentMonth,
        end: endOfMonth(firstDayCurrentMonth),
      }),
    [firstDayCurrentMonth],
  );

  const refreshBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await listActiveBookingsFrom(monthStartKey);
      setBookings(data);
    } catch {
      setError("Error al cargar las reservas");
    } finally {
      setIsLoading(false);
    }
  }, [monthStartKey]);

  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  const bookingsByDay = useMemo<BookingsByDay>(() => {
    return bookings.reduce<BookingsByDay>((acc, booking) => {
      const dateKey = formatApiDate(booking.booking_date);
      if (!dateKey.startsWith(monthPrefix)) {
        return acc;
      }

      if (!acc[dateKey]) {
        acc[dateKey] = { cantidad: 0, reservas: [] };
      }

      acc[dateKey].cantidad += 1;
      acc[dateKey].reservas.push(booking);
      return acc;
    }, {});
  }, [bookings, monthPrefix]);

  const previousMonth = () => {
    const next = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(next, "MMM-yyyy"));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    const next = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(next, "MMM-yyyy"));
    setSelectedDay(null);
  };

  const selectDay = (day: Date) => {
    setSelectedDay(formatApiDate(day));
  };

  return {
    firstDayCurrentMonth,
    days,
    isLoading,
    error,
    selectedDay,
    setSelectedDay,
    bookingsByDay,
    previousMonth,
    nextMonth,
    selectDay,
    refreshBookings,
    toDisplayDate,
  };
}
