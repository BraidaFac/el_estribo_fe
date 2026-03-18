"use client";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid/index.js";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import {
  format,
  getDay,
  isBefore,
  isToday,
  startOfToday,
} from "date-fns";
import { useMemo } from "react";
import { BookingState } from "../utils/booking";
import { formatApiDate } from "../utils/dateOnly";
import { formatMonth } from "../utils/date_formatter";
import { SuitState, getState } from "../utils/suit";
import { CALENDAR_COLORS } from "../utils/uiStyles";
import { useCalendar } from "./hooks/useCalendar";
function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
} /*  */

function isFuture(day: any) {
  return isBefore(startOfToday(), day);
}

function getCalendarDayButtonClass({
  isCurrentDay,
  isFutureDay,
  hasBooking,
  hasDressmakerBusy,
  hasLaundryBusy,
  hasPreparationBusy,
}: {
  isCurrentDay: boolean;
  isFutureDay: boolean;
  hasBooking: boolean;
  hasDressmakerBusy: boolean;
  hasLaundryBusy: boolean;
  hasPreparationBusy: boolean;
}) {
  return classNames(
    "text-pastel-text font-semibold w-full h-full flex flex-col justify-center items-center",
    isCurrentDay ? "bg-pastel-primary" : "text-gray-900",
    isFutureDay && "bg-pastel-secondary/40",
    hasBooking && "text-gray-900 " + CALENDAR_COLORS.booking,
    hasDressmakerBusy && CALENDAR_COLORS.dressmaker,
    hasLaundryBusy && CALENDAR_COLORS.laundry,
    hasPreparationBusy && CALENDAR_COLORS.preparation,
  );
}

export default function Calendar() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    suit,
    formError,
    firstDayCurrentMonth,
    days,
    selectedDay,
    selectedBookingToCancel,
    isEditing,
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
  } = useCalendar();

  const bookingDayKeys = useMemo(
    () => new Set(bookings.map((booking) => formatApiDate(booking.booking_date))),
    [bookings],
  );
  const bookingMapByDay = useMemo(() => {
    const map = new Map<string, typeof bookings>();
    bookings.forEach((booking) => {
      const key = formatApiDate(booking.booking_date);
      const list = map.get(key);
      if (list) {
        list.push(booking);
      } else {
        map.set(key, [booking]);
      }
    });
    return map;
  }, [bookings]);
  const busyDressmakerKeys = useMemo(
    () => new Set(busyDaysDressmaker.map((day) => format(day, "yyyy-MM-dd"))),
    [busyDaysDressmaker],
  );
  const busyLaundryKeys = useMemo(
    () => new Set(busyDaysLaundry.map((day) => format(day, "yyyy-MM-dd"))),
    [busyDaysLaundry],
  );
  const busyPreparationKeys = useMemo(
    () => new Set(busyDaysPreparation.map((day) => format(day, "yyyy-MM-dd"))),
    [busyDaysPreparation],
  );
  return (
    <div className="p-5 h-full">
      {!suit ? (
        <div className="w-full">
          <p className="text-4xl text-pastel-text text-center mt-28">
            Seleccione un traje
          </p>
        </div>
      ) : (
        <>
          <div className="px-2">
            <h1 className="text-2xl text-pastel text-right">
              Traje <span className="text-pink-500">{suit.id}</span>
            </h1>
            <h2 className="text-1xl text-pastel text-right">
              <span className="text-pink-500">
                {getState(suit?.state as SuitState)}
              </span>
            </h2>
          </div>

          <div className="">
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={previousMonth}
                className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400"
              >
                <ChevronLeftIcon className="w-8 h-8" aria-hidden="true" />
              </button>
              <h2 className="flex-auto text-center font-semibold text-lg md:text-2xl text-pastel-text">
                {formatMonth(firstDayCurrentMonth)}
              </h2>

              <button
                onClick={nextMonth}
                type="button"
                className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
              >
                <ChevronRightIcon className="w-8 h-8" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-pastel-primary">
              <div className="w-full ">D</div>
              <div className="w-full ">L</div>
              <div className="w-full ">M</div>
              <div className="w-full ">M</div>
              <div className="w-full ">J</div>
              <div className="w-full ">V</div>
              <div className="w-full ">S</div>
            </div>
            <div className="grid grid-cols-7 mt-2 text-sm gap-2 p-2">
              {days.map((day, dayIdx) => {
                const dayKey = format(day, "yyyy-MM-dd");
                const isCurrentDay = isToday(day);
                const isFutureDay = isFuture(day);
                const hasDressmakerBusy = busyDressmakerKeys.has(dayKey);
                const hasLaundryBusy = busyLaundryKeys.has(dayKey);
                const hasPreparationBusy = busyPreparationKeys.has(dayKey);
                const hasBooking = bookingDayKeys.has(dayKey);
                const dayBookings = bookingMapByDay.get(dayKey) || [];

                const isDisabled =
                  hasDressmakerBusy ||
                  hasLaundryBusy ||
                  hasPreparationBusy ||
                  (!isFutureDay && !isCurrentDay && !hasBooking);

                return (
                  <div
                    key={day.toString()}
                    className={classNames(
                      dayIdx === 0 && colStartClasses[getDay(day)],
                      "relative md:h-28 h-14 w-full border-solid border-2 border-pastel-border transition-all duration-300 ease-out",
                      "hover:shadow-md hover:-translate-y-[1px]",
                      isCurrentDay &&
                        "ring-2 ring-pastel-primary/70 ring-offset-1 ring-offset-pastel-bg shadow-[0_0_12px_rgba(127,115,150,0.35)] bg-gradient-to-b from-pastel-primary/15 to-pastel-secondary/15 hover:shadow-[0_0_18px_rgba(127,115,150,0.5)] hover:scale-[1.01]",
                    )}
                  >
                    <button
                      onClick={() => {
                        verifyDay(day);
                        onOpen();
                      }}
                      disabled={isDisabled}
                      type="button"
                      className={getCalendarDayButtonClass({
                        isCurrentDay,
                        isFutureDay,
                        hasBooking,
                        hasDressmakerBusy,
                        hasLaundryBusy,
                        hasPreparationBusy,
                      })}
                    >
                      {isCurrentDay && (
                        <span className="pointer-events-none absolute right-1.5 top-1.5 flex h-3 w-3">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pastel-accent/60" />
                          <span className="relative inline-flex h-3 w-3 rounded-full bg-pastel-primary" />
                        </span>
                      )}
                      <div className="w-full h-full flex flex-col justify-center items-center">
                        <time dateTime={dayKey} className={"md:text-sm text-xs shrink-0 " + `${isCurrentDay && "text-white "}`}>{format(day, "d")}</time>
                        <div className="w-full flex-1 text-pastel-text flex flex-col justify-center items-center">
                          {dayBookings.map((booking) => (
                            <div className=" text-pastel-text text-xs md:text-sm" key={booking.id}>
                              <p>{booking.client_name.toUpperCase()}</p>  
                              <p>{booking.client_phone}</p>
                            </div>
                          ))}
                          {hasDressmakerBusy && (
                            <div className=" text-pastel-text text-xs md:text-sm">MODISTA</div>
                          )}
                          {hasLaundryBusy && (
                            <div className=" text-pastel-text text-xs md:text-sm">LAVANDERIA</div>
                          )}
                          {hasPreparationBusy && (
                            <div className=" text-pastel-text text-xs md:text-sm">EN LOCAL</div>
                          )}

                          </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
        className={`${
          selectedDay || isEditing ? "h-5/6 rounded-lg overflow-hidden" : ""
        } overflow-auto`}
        onClose={resetModalState}
      >
        <ModalContent className="rounded-lg overflow-auto">
          {(onClose) =>
            selectedDay || isEditing ? (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {isEditing ? "Modificar reserva" : "Reservar un traje"}
                </ModalHeader>
                <ModalBody>
                  <form id="booking-form" className="flex flex-col gap-3 ">
                    <Input
                      isRequired
                      label="DNI Cliente"
                      name="client_dni"
                      value={formData.client_dni}
                      onChange={handleInputChange}
                    ></Input>
                    <Input
                      isRequired
                      label="Nombre Cliente"
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleInputChange}
                    ></Input>
                    <Input
                      isRequired
                      label="Telefono Cliente"
                      name="client_phone"
                      value={formData.client_phone}
                      onChange={handleInputChange}
                    ></Input>
                    <Input
                      isRequired
                      label="Cuenta asociada"
                      name="account_related"
                      value={formData.account_related}
                      onChange={handleInputChange}
                    ></Input>
                    <Input
                      isRequired
                      label="Traje"
                      name="suit_id"
                      value={formData.suit_id}
                      disabled
                      onChange={handleInputChange}
                    ></Input>
                    <Input
                      isRequired
                      label="Color"
                      name="color"
                      disabled
                      value={formData.color}
                      onChange={handleInputChange}
                      type="text"
                    ></Input>
                    <Input
                      isRequired
                      label="Fecha evento"
                      type="text"
                      name="booking_date"
                      disabled
                      value={formData.booking_date}
                      onChange={handleInputChange}
                    ></Input>
                    <Input
                      label="Largo Manga"
                      type="text"
                      name="l_manga"
                      value={formData.l_manga}
                      onChange={handleInputChange}
                    ></Input>
                    <Input
                      label="Largo Pierna"
                      type="text"
                      name="l_pierna"
                      value={formData.l_pierna}
                      onChange={handleInputChange}
                    ></Input>
                    <Textarea
                      label="Observaciones"
                      name="other_observations"
                      value={formData.other_observations}
                      onChange={handleInputChange}
                    ></Textarea>
                    <div className="flex flex-row gap-3 p-2">
                      <label className="text-black ">Modista</label>
                      <input
                        className="w-6 h-6"
                        type="checkbox"
                        name="tailor"
                        checked={formData.tailor}
                        onChange={handleInputChange}
                      />
                    </div>
                    {formError && (
                      <span className="text-red-500">
                        Todos los campos son obligatorios
                      </span>
                    )}
                  </form>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    color="primary"
                    onClick={async (e) => {
                      e.preventDefault();
                      const success = await saveBooking();
                      if (success) {
                        onOpenChange();
                      }
                    }}
                  >
                    {isEditing ? "Modificar" : "Reservar"}
                  </Button>
                </ModalFooter>
              </>
            ) : selectedBookingToCancel?.booking_state !==
              BookingState.COMPLETED ? (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Acciones
                </ModalHeader>
                <ModalBody>
                  <Button
                    isDisabled={suit?.state !== SuitState.LISTOENTREGA}
                    color="primary"
                    variant="light"
                    onPress={async () => {
                      await markBookingRetired();
                      onOpenChange();
                    }}
                  >
                    RETIRO
                  </Button>
                  <Button
                    isDisabled={suit?.state !== SuitState.RETIRADO}
                    color="primary"
                    variant="light"
                    onPress={async () => {
                      await markBookingReturned();
                      onOpenChange();
                    }}
                  >
                    DEVOLVIO
                  </Button>
                  <Button
                    color="primary"
                    variant="light"
                    onPress={async () => {
                      startEditingFromSelected();
                    }}
                  >
                    EDITAR
                  </Button>
                  <Button
                    color="danger"
                    disabled={suit?.state === SuitState.RETIRADO}
                    variant="light"
                    onPress={async () => {
                      await cancelSelectedBooking();
                      onOpenChange();
                    }}
                  >
                    CANCELAR
                  </Button>
                </ModalBody>
              </>
            ) : (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  La reserva ya se completo
                </ModalHeader>
              </>
            )
          }
        </ModalContent>
      </Modal>
    </div>
  );
}

let colStartClasses = [
  "",
  "col-start-2",
  "col-start-3",
  "col-start-4",
  "col-start-5",
  "col-start-6",
  "col-start-7",
];
