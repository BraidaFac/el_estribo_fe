"use client";

import { useAppContext } from "@/lib/components/AppContext";
import {
  createBooking,
  deleteBooking,
  getSuitBookings,
  getSuitBusyDates,
  updateBooking,
  updateBookingStatus,
} from "@/lib/services/booking.service";
import { Booking, BookingState } from "@/lib/utils/booking";
import { formatApiDate } from "@/lib/utils/dateOnly";
import { SuitState } from "@/lib/utils/suit";
import { add, eachDayOfInterval, endOfMonth, format, parse, startOfToday } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type CalendarFormData = {
  client_dni: string;
  client_name: string;
  client_phone: string;
  account_related: string;
  suit_id: string;
  color: string;
  booking_date: string;
  l_manga: string;
  l_pierna: string;
  other_observations: string;
  tailor: boolean;
};

const EMPTY_FORM: CalendarFormData = {
  client_dni: "",
  client_name: "",
  client_phone: "",
  account_related: "",
  suit_id: "",
  color: "",
  booking_date: "",
  l_manga: "",
  l_pierna: "",
  other_observations: "",
  tailor: false,
};

export function useCalendar() {
  const { suit, setSuit, isLoading, showSuccess, showError } = useAppContext();
  const [formError, setFormError] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(format(startOfToday(), "MMM-yyyy"));
  const firstDayCurrentMonth = useMemo(
    () => parse(currentMonth, "MMM-yyyy", new Date()),
    [currentMonth],
  );
  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: firstDayCurrentMonth,
        end: endOfMonth(firstDayCurrentMonth),
      }),
    [firstDayCurrentMonth],
  );

  const [selectedDay, setSelectedDay] = useState<Date>();
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState<Booking>();
  const [isEditing, setIsEditing] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking>();
  const [formData, setFormData] = useState<CalendarFormData>(EMPTY_FORM);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [busyDaysLaundry, setBusyDaysLaundry] = useState<Date[]>([]);
  const [busyDaysDressmaker, setBusyDaysDressmaker] = useState<Date[]>([]);
  const [busyDaysPreparation, setBusyDaysPreparation] = useState<Date[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const refreshBookings = useCallback(async () => {
    if (!suit?.id) return;
    const suitBookings = await getSuitBookings(suit.id);
    setBookings(suitBookings);
    const busyDates = await getSuitBusyDates(suit.id);
    setBusyDaysLaundry(busyDates.laundry.map((day) => new Date(day)));
    setBusyDaysDressmaker(busyDates.dressmaker.map((day) => new Date(day)));
    setBusyDaysPreparation(busyDates.preparation.map((day) => new Date(day)));
  }, [suit?.id]);

  useEffect(() => {
    if (suit) {
      refreshBookings().catch(() => {
        toast.error("No se pudieron cargar las reservas del traje");
      });
    }
  }, [refreshBookings, suit]);

  useEffect(() => {
    if (isEditing && editingBooking) {
      setFormData({
        client_dni: editingBooking.client_dni || "",
        client_name: editingBooking.client_name || "",
        client_phone: editingBooking.client_phone || "",
        account_related: editingBooking.account_related || "",
        suit_id: editingBooking.suit?.id || suit?.id || "",
        color: editingBooking.suit?.color || suit?.color || "",
        booking_date: editingBooking.booking_date
          ? formatApiDate(editingBooking.booking_date)
          : "",
        l_manga: editingBooking.l_manga || "",
        l_pierna: editingBooking.l_pierna || "",
        other_observations: editingBooking.other_observations || "",
        tailor: editingBooking.dressmaker || false,
      });
      return;
    }

    if (!isEditing) {
      setFormData({
        ...EMPTY_FORM,
        suit_id: suit?.id || "",
        color: suit?.color || "",
        booking_date: selectedDay ? formatApiDate(selectedDay) : "",
      });
    }
  }, [editingBooking, isEditing, selectedDay, suit]);

  const previousMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  };

  const nextMonth = () => {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  };

  const verifyDay = (day: Date) => {
    const existingBooking = bookings.find((booking) =>
      formatApiDate(booking.booking_date) === formatApiDate(day),
    );
    if (existingBooking) {
      setSelectedBookingToCancel(existingBooking);
      return;
    }
    setSelectedDay(day);
  };

  const buildObservations = (
    lManga: string,
    lPierna: string,
    otherObservations: string,
  ) => `${lManga ? `L.Manga: ${lManga}` : ""}\n ${lPierna ? `L.Pierna: ${lPierna}` : ""}\n Otros: ${otherObservations}`;

  const saveBooking = async () => {
    try {
      const {
        suit_id,
        booking_date,
        tailor,
        client_dni,
        client_name,
        client_phone,
        other_observations,
        l_manga,
        l_pierna,
        account_related,
      } = formData;

      if (!client_dni || !client_name || !client_phone || !account_related) {
        setFormError(true);
        return false;
      }

      const payload = {
        suit: { id: suit_id },
        booking_date: formatApiDate(booking_date),
        dressmaker: tailor,
        client_dni,
        client_name,
        client_phone,
        observations: buildObservations(l_manga, l_pierna, other_observations),
        account_related,
      };

      if (isEditing && editingBooking) {
        await updateBooking(editingBooking.id, payload);
        showSuccess("Reserva modificada");
        setIsEditing(false);
        setEditingBooking(undefined);
      } else {
        await createBooking(payload);
        showSuccess("Reserva exitosa");
      }
      await refreshBookings();
      return true;
    } catch (error) {
      showError(`Error al ${isEditing ? "modificar" : "crear"} la reserva. `+(error as Error).message);
      return false;
    }
  };

  const markBookingRetired = async () => {
    if (!selectedBookingToCancel) return;
    try {
      const response = await updateBookingStatus(selectedBookingToCancel.id, {
        booking_state: BookingState.INPROGRESS,
        suit_state: SuitState.RETIRADO,
        booking_retired_suit: new Date(),
      });
      setSuit(response.suit);
      await refreshBookings();
      showSuccess("Traje retirado");
    } catch {
      toast.error("Error al retirar el traje");
    }
  };

  const markBookingReturned = async () => {
    if (!selectedBookingToCancel) return;
    try {
      const response = await updateBookingStatus(selectedBookingToCancel.id, {
        booking_state: BookingState.COMPLETED,
        suit_state: SuitState.ENLOCALSUCIO,
        booking_return_suit: new Date(),
      });
      if (selectedBookingToCancel.dressmaker) {
        showSuccess("Recordar que fue con modista");
      }
      setSuit(response.suit);
      await refreshBookings();
      showSuccess("Traje devuelto");
    } catch {
      toast.error("Error al devolver el traje");
    }
  };

  const cancelSelectedBooking = async () => {
    if (!selectedBookingToCancel) return;
    try {
      await deleteBooking(selectedBookingToCancel.id);
      await refreshBookings();
      showSuccess("Reserva cancelada");
    } catch {
      toast.error("Error al cancelar la reserva");
    }
  };

  const startEditingFromSelected = () => {
    if (!selectedBookingToCancel) return;
    setIsEditing(true);
    setEditingBooking({
      ...selectedBookingToCancel,
      l_manga: selectedBookingToCancel.observations?.split("\n")[0]?.slice(9),
      l_pierna: selectedBookingToCancel.observations?.split("\n")[1]?.slice(11),
      other_observations: selectedBookingToCancel.observations
        ?.split("\n")[2]
        ?.slice(8),
    });
  };

  const resetModalState = () => {
    setFormError(false);
    setSelectedDay(undefined);
    setEditingBooking(undefined);
    setIsEditing(false);
    setSelectedBookingToCancel(undefined);
  };

  return {
    suit,
    isLoading,
    formError,
    setFormError,
    currentMonth,
    firstDayCurrentMonth,
    days,
    selectedDay,
    setSelectedDay,
    selectedBookingToCancel,
    setSelectedBookingToCancel,
    isEditing,
    setIsEditing,
    editingBooking,
    setEditingBooking,
    formData,
    bookings,
    busyDaysLaundry,
    busyDaysDressmaker,
    busyDaysPreparation,
    handleInputChange,
    previousMonth,
    nextMonth,
    verifyDay,
    saveBooking,
    markBookingRetired,
    markBookingReturned,
    cancelSelectedBooking,
    startEditingFromSelected,
    resetModalState,
  };
}
