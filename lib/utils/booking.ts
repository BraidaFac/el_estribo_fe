import { Suit } from "./suit";

export interface Booking {
  id: number;
  booking_created: Date;
  end_at: Date;
  booking_date: Date;
  booking_state: BookingState;
  booking_return_suit: Date;
  booking_retired_suit: Date;
  account_related: string;
  suit: Suit;
  client_dni: string;
  client_name: string;
  client_phone: string;
  observations: string;
  dressmaker: boolean;
  l_manga?: string;
  l_pierna?: string;
  other_observations?: string;
}

export enum BookingState {
  ACTIVED = "ACTIVED",
  CANCELED = "CANCELED",
  COMPLETED = "COMPLETED",
  INPROGRESS = "INPROGRESS",
}

const bookingStateMapper: { [key: string]: string } = {
  ACTIVED: "Reserva Activa",
  CANCELED: "Reserva Cancelada",
  COMPLETED: "Reserva Completada",
  INPROGRESS: "Reserva en Progreso",
};

export function mapBookingState(state: string): string {
  return bookingStateMapper[state] || "Estado Desconocido";
}

export const stateColorMap: Record<
  BookingState,
  "success" | "danger" | "warning" | "primary"
> = {
  ACTIVED: "success",
  CANCELED: "danger",
  INPROGRESS: "warning",
  COMPLETED: "primary",
};
