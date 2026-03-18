"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@heroui/react";
import { format, getDay, isToday } from "date-fns";
import { useCalendarReservas } from "./hooks/useCalendarReservas";

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function CalendarReservas() {
  const {
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
  } = useCalendarReservas();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner color="danger" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-3">
        <p className="text-red-600">{error}</p>
        <Button color="primary" onPress={refreshBookings}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 h-full">
      <div className="flex items-center text-center">
        <button
          type="button"
          onClick={previousMonth}
          className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400"
        >
          <ChevronLeftIcon className="w-8 h-8" aria-hidden="true" />
        </button>
        <h2 className="flex-auto font-semibold text-2xl text-pastel-text">
          {format(firstDayCurrentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={nextMonth}
          type="button"
          className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
        >
          <ChevronRightIcon className="w-8 h-8" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-pastel-primary">
        <div>D</div>
        <div>L</div>
        <div>M</div>
        <div>M</div>
        <div>J</div>
        <div>V</div>
        <div>S</div>
      </div>

      <div className="grid grid-cols-7 mt-2 text-sm gap-2 p-2">
        {days.map((day, dayIdx) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const dayData = bookingsByDay[dayKey];

          return (
            <div
              key={day.toString()}
              className={classNames(
                dayIdx === 0 && colStartClasses[getDay(day)],
                "md:h-28 h-14 w-full border-solid border-2 border-pastel-border relative",
              )}
            >
              <button
                onClick={() => {
                  selectDay(day);
                }}
                type="button"
                className={classNames(
                  "text-pastel-text font-semibold",
                  isToday(day) && "bg-pastel-primary/80 text-white",
                  !isToday(day) && "bg-pastel-soft",
                  "w-full h-full flex flex-col justify-center items-start p-1",
                )}
              >
                <span className="text-xs md:text-sm absolute top-0 md:top-1 left-1 text-pastel-text">
                  {format(day, "d")}
                </span>
                <span
                  className={`text-lg font-bold text-center self-center ${
                    dayData?.cantidad ? "text-pink-500" : "text-pastel-text"
                  } `}
                >
                  {dayData?.cantidad || 0}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        placement="center"
        backdrop="blur"
        className="h-5/6 my-5 overflow-auto"
      >
        <ModalContent>
          <ModalHeader>
            Reservas del día {selectedDay ? toDisplayDate(selectedDay) : ""}
          </ModalHeader>
          <ModalBody>
            {selectedDay && bookingsByDay?.[selectedDay] ? (
              bookingsByDay[selectedDay].reservas.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-pastel-soft shadow-lg rounded-md p-2 border border-pastel-border"
                >
                    <h1 className="text-xl text-pastel-text font-bold text-center">
                      Reserva numero: {booking.id}
                    </h1>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-blue-700 mb-2">
                        Información del Cliente
                      </h3>
                      <p>
                        <strong>Nombre: </strong> {booking.client_name}
                      </p>
                      <p>
                        <strong>Celular: </strong>
                        {booking.client_phone}
                      </p>
                    </div>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-blue-700 mb-2">
                        Información del Traje
                      </h3>
                      <p>
                        <strong>Codigo Traje: </strong>
                        {booking.suit.id}
                      </p>

                      <p>
                        <strong>Color: </strong>
                        {booking.suit.color}
                      </p>
                      <p>
                        <strong>Talle: </strong>
                        {booking.suit.size}
                      </p>
                    </div>
                </div>
              ))
            ) : (
              <p className="text-center text-red-800 text-xl">
                No hay información disponible para este día.
              </p>
            )}
          </ModalBody>

          <ModalFooter>
            <Button color="primary" onPress={() => setSelectedDay(null)}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

const colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];
