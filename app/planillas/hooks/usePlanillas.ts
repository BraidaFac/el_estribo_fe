"use client";

import {
  listBookings,
  updateBookingStatus,
} from "@/lib/services/booking.service";
import {
  listSuitsInLaundry,
  listSuitsToLaundry,
  listSuitsToTakeFromLaundry,
  updateSuit,
} from "@/lib/services/suit.service";
import { Booking, BookingState } from "@/lib/utils/booking";
import { formatApiDate } from "@/lib/utils/dateOnly";
import { Suit, SuitState } from "@/lib/utils/suit";
import { addDays } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export type PlanillaType = "retiros" | "devolucion" | "llevar" | "retirar";

type BookingWithNextDate = {
  booking: Booking;
  nextBookingDate?: string;
};

type SuitWithNextDate = {
  suit: Suit;
  nextBookingDate?: string;
};

function getNextActiveBookingDate(
  bookings: Booking[],
  todayKey: string,
): string | undefined {
  let nextDate: string | undefined;

  bookings.forEach((booking) => {
    const bookingDate = formatApiDate(booking.booking_date);
    if (booking.booking_state !== BookingState.ACTIVED || bookingDate <= todayKey) {
      return;
    }

    if (!nextDate || bookingDate < nextDate) {
      nextDate = bookingDate;
    }
  });

  return nextDate;
}

export function usePlanillas(type: PlanillaType) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nearBookings, setNearBookings] = useState<Booking[]>([]);
  const [bookingsToReturn, setBookingsToReturn] = useState<BookingWithNextDate[]>([]);
  const [suitsToLaundry, setSuitsToLaundry] = useState<Suit[]>([]);
  const [suitsInLaundry, setSuitsInLaundry] = useState<SuitWithNextDate[]>([]);
  const [suitsToTakeLaundry, setSuitsToTakeLaundry] = useState<SuitWithNextDate[]>([]);

  const refreshNearBookings = useCallback(async () => {
    const bookings = await listBookings();
    const todayKey = formatApiDate(new Date());
    const maxDayKey = formatApiDate(addDays(new Date(), 8));

    const filtered = bookings
      .filter((booking) => {
        const bookingKey = formatApiDate(booking.booking_date);
        const inWindow =
          bookingKey < todayKey ||
          (bookingKey >= todayKey && bookingKey <= maxDayKey);
        return (
          inWindow &&
          booking.booking_state === BookingState.ACTIVED &&
          booking.suit.state !== SuitState.RETIRADO
        );
      })
      .sort((a, b) =>
        formatApiDate(a.booking_date).localeCompare(formatApiDate(b.booking_date)),
      );

    setNearBookings(filtered);
  }, []);

  const refreshBookingsToReturn = useCallback(async () => {
    const bookings = await listBookings();
    const todayKey = formatApiDate(new Date());

    const mapped = bookings
      .filter((booking) => booking.booking_state === BookingState.INPROGRESS)
      .map((booking) => {
        const suitBookings = bookings.filter(
          (candidate) => candidate.suit.id === booking.suit.id,
        );
        return {
          booking,
          nextBookingDate: getNextActiveBookingDate(suitBookings, todayKey),
        };
      })
      .sort((a, b) => {
        if (!a.nextBookingDate && !b.nextBookingDate) return 0;
        if (!a.nextBookingDate) return 1;
        if (!b.nextBookingDate) return -1;
        return a.nextBookingDate.localeCompare(b.nextBookingDate);
      });

    setBookingsToReturn(mapped);
  }, []);

  const refreshSuitsToLaundry = useCallback(async () => {
    const suits = await listSuitsToLaundry();
    setSuitsToLaundry(suits);
  }, []);

  const refreshLaundryBoards = useCallback(async () => {
    const [inLaundry, toTake] = await Promise.all([
      listSuitsInLaundry(),
      listSuitsToTakeFromLaundry(),
    ]);

    const todayKey = formatApiDate(new Date());

    const mapWithNext = (suit: Suit): SuitWithNextDate => ({
      suit,
      nextBookingDate: getNextActiveBookingDate(suit.bookings || [], todayKey),
    });

    const byNextDate = (a: SuitWithNextDate, b: SuitWithNextDate) => {
      if (!a.nextBookingDate && !b.nextBookingDate) return 0;
      if (!a.nextBookingDate) return 1;
      if (!b.nextBookingDate) return -1;
      return a.nextBookingDate.localeCompare(b.nextBookingDate);
    };

    setSuitsInLaundry(inLaundry.map(mapWithNext).sort(byNextDate));
    setSuitsToTakeLaundry(toTake.map(mapWithNext).sort(byNextDate));
  }, []);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (type === "retiros") {
        await refreshNearBookings();
      } else if (type === "devolucion") {
        await refreshBookingsToReturn();
      } else if (type === "llevar") {
        await refreshSuitsToLaundry();
      } else if (type === "retirar") {
        await refreshLaundryBoards();
      }
    } catch {
      setError("No se pudo cargar la información de planillas");
    } finally {
      setIsLoading(false);
    }
  }, [
    refreshBookingsToReturn,
    refreshLaundryBoards,
    refreshNearBookings,
    refreshSuitsToLaundry,
    type,
  ]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const markBookingRetired = useCallback(
    async (bookingId: number) => {
      try {
        await updateBookingStatus(bookingId, {
          booking_state: BookingState.INPROGRESS,
          suit_state: SuitState.RETIRADO,
          booking_retired_suit: formatApiDate(new Date()),
        });
        toast.success("Traje retirado");
        await refreshNearBookings();
      } catch {
        toast.error("Error al retirar el traje");
      }
    },
    [refreshNearBookings],
  );

  const markBookingReturned = useCallback(
    async (bookingId: number) => {
      try {
        await updateBookingStatus(bookingId, {
          booking_state: BookingState.COMPLETED,
          suit_state: SuitState.ENLOCALSUCIO,
          booking_return_suit: formatApiDate(new Date()),
        });
        toast.success("Traje devuelto correctamente");
        await refreshBookingsToReturn();
      } catch {
        toast.error("Error al devolver traje");
      }
    },
    [refreshBookingsToReturn],
  );

  const sendSuitToDressmaker = useCallback(
    async (suitId: string) => {
      try {
        await updateSuit({ id: suitId, state: SuitState.MODISTA });
        toast.success("Traje en Modista");
        await refreshNearBookings();
      } catch {
        toast.error("Error, intente nuevamente");
      }
    },
    [refreshNearBookings],
  );

  const markSuitReadyToDeliver = useCallback(
    async (suitId: string) => {
      try {
        await updateSuit({ id: suitId, state: SuitState.LISTOENTREGA });
        toast.success("Traje listo para entregar");
        await refreshNearBookings();
      } catch {
        toast.error("Error, intente nuevamente");
      }
    },
    [refreshNearBookings],
  );

  const markLaundryDelivered = useCallback(
    async (suitId: string, laundry: "lucecita" | "celia") => {
      try {
        await updateSuit({
          id: suitId,
          state:
            laundry === "lucecita"
              ? SuitState.LAVANDERIALUCECITASUCIO
              : SuitState.LAVANDERIACELIASUCIO,
        });
        toast.success("Traje entregado correctamente");
        await refreshSuitsToLaundry();
      } catch {
        toast.error("Error al entregar traje");
      }
    },
    [refreshSuitsToLaundry],
  );

  const markLaundryClean = useCallback(
    async (suitId: string, state: string) => {
      try {
        await updateSuit({
          id: suitId,
          state:
            state === SuitState.LAVANDERIALUCECITASUCIO
              ? SuitState.LAVANDERIALUCECITALIMPIO
              : SuitState.LAVANDERIACELIALIMPIO,
        });
        toast.success("Traje limpio");
        await refreshLaundryBoards();
      } catch {
        toast.error("Error, intente nuevamente");
      }
    },
    [refreshLaundryBoards],
  );

  const markSuitDeliveredFromLaundry = useCallback(
    async (suitId: string) => {
      try {
        await updateSuit({ id: suitId, state: SuitState.ENLOCALLIMPIO });
        toast.success("Traje retirado");
        await refreshLaundryBoards();
      } catch {
        toast.error("Error al entregar el traje");
      }
    },
    [refreshLaundryBoards],
  );

  return {
    isLoading,
    error,
    nearBookings,
    bookingsToReturn,
    suitsToLaundry,
    suitsInLaundry,
    suitsToTakeLaundry,
    refresh,
    markBookingRetired,
    markBookingReturned,
    sendSuitToDressmaker,
    markSuitReadyToDeliver,
    markLaundryDelivered,
    markLaundryClean,
    markSuitDeliveredFromLaundry,
  };
}
