import { Booking } from "@/lib/utils/booking";
import { formatApiDate } from "@/lib/utils/dateOnly";
import { apiFetch } from "./http";

export async function listBookings(): Promise<Booking[]> {
  return apiFetch<Booking[]>("/booking");
}

export async function listActiveBookingsFrom(date: string): Promise<Booking[]> {
  return apiFetch<Booking[]>(`/booking/active?date=${date}`);
}

export async function listBookingsByDateDesc(): Promise<Booking[]> {
  const bookings = await listBookings();
  return [...bookings].sort(
    (a, b) =>
      new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime(),
  );
}


export async function getSuitBookings(suitId: string): Promise<Booking[]> {
  return apiFetch<Booking[]>(`/booking/suit/${suitId}`, {
    method: "GET",
  });
}

type SuitBusyDatesResponse = {
  laundry: string[];
  dressmaker: string[];
  preparation: string[];
};

type BookingPayload = {
  suit: { id: string };
  booking_date: string;
  dressmaker: boolean;
  client_dni: string;
  client_name: string;
  client_phone: string;
  observations: string;
  account_related: string;
};

type UpdateBookingStatePayload = {
  booking_state?: string;
  suit_state?: string;
  booking_retired_suit?: string | Date;
  booking_return_suit?: string | Date;
};

export async function getSuitBusyDates(
  suitId: string,
): Promise<SuitBusyDatesResponse> {
  return apiFetch<SuitBusyDatesResponse>(`/booking/suit/${suitId}/fechas`, {
    method: "GET",
  });
}

export async function createBooking(payload: BookingPayload): Promise<Booking> {
  return apiFetch<Booking>("/booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      booking_date: formatApiDate(payload.booking_date),
    }),
  });
}

export async function updateBooking(
  bookingId: number,
  payload: BookingPayload,
): Promise<Booking> {
  return apiFetch<Booking>(`/booking/${bookingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      booking_date: formatApiDate(payload.booking_date),
    }),
  });
}

export async function deleteBooking(bookingId: number): Promise<void> {
  await apiFetch(`/booking/${bookingId}`, {
    method: "DELETE",
  });
}

export async function updateBookingStatus(
  bookingId: number,
  payload: UpdateBookingStatePayload,
): Promise<Booking> {
  return apiFetch<Booking>(`/booking/${bookingId}/estados`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      booking_retired_suit: payload.booking_retired_suit
        ? formatApiDate(payload.booking_retired_suit)
        : undefined,
      booking_return_suit: payload.booking_return_suit
        ? formatApiDate(payload.booking_return_suit)
        : undefined,
    }),
  });
}

export async function updateBookingState(
  bookingId: number,
  bookingState: string,
): Promise<void> {
  await apiFetch(`/booking/${bookingId}/estados`, {
    method: "PATCH",
    body: JSON.stringify({ booking_state: bookingState }),
  });
}
