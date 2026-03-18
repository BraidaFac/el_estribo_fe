"use client";

import { useAppContext } from "@/lib/components/AppContext";
import {
  listActiveBookingsFrom,
  listBookings
} from "@/lib/services/booking.service";
import { Booking } from "@/lib/utils/booking";
import { formatApiDate } from "@/lib/utils/dateOnly";
import { useCallback, useEffect, useMemo, useState } from "react";

type GroupedBookings = Record<string, Booking[]>;

function toDisplayDate(dateInput: Date | string): string {
  const apiDate = formatApiDate(dateInput);
  const [year, month, day] = apiDate.split("-");
  return `${day}/${month}/${year}`;
}

function toSortableKey(displayDate: string): string {
  const [day, month, year] = displayDate.split("/");
  return `${year}-${month}-${day}`;
}

export function useDiario() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dailyBookings, setDailyBookings] = useState<Booking[]>([]);
  const { isLoading, setIsLoading , error, setError} = useAppContext();

  const refreshBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [allBookings, activeFromToday] = await Promise.all([
        listBookings(),
        listActiveBookingsFrom(formatApiDate(new Date())),
      ]);

      setBookings(allBookings);
      setDailyBookings(activeFromToday);
    } catch {
      setError("No se pudieron cargar las reservas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  const groupedBookings = useMemo<GroupedBookings>(() => {
    return dailyBookings.reduce<GroupedBookings>((acc, booking) => {
      const displayDate = toDisplayDate(booking.booking_date);
      if (!acc[displayDate]) {
        acc[displayDate] = [];
      }
      acc[displayDate].push(booking);
      return acc;
    }, {});
  }, [dailyBookings]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedBookings).sort((a, b) =>
      toSortableKey(a).localeCompare(toSortableKey(b)),
    );
  }, [groupedBookings]);

  return {
    bookings,
    groupedBookings,
    sortedDates,
    isLoading,
    error,
    refreshBookings,
  };
}
