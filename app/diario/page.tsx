"use client";
import CalendarReservas from "@/lib/components/CalendarReservas";
import { mapBookingState, type Booking } from "@/lib/utils/booking";
import { formatApiDate } from "@/lib/utils/dateOnly";
import { formatMonth } from "@/lib/utils/date_formatter";
import { getState, SuitState } from "@/lib/utils/suit";
import { TABLE_HEADER_CLASS, TABLE_TITLE_CLASS, TABLE_WRAPPER_CLASS } from "@/lib/utils/uiStyles";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useMemo, useState } from "react";
import { useDiario } from "./hooks/useDiario";

type DiarioColumnKey = "suit" | "observations";

function toDisplayDate(dateInput: Date | string): string {
  const apiDate = formatApiDate(dateInput);
  const [year, month, day] = apiDate.split("-");
  return `${day}/${month}/${year}`;
}

function getMonthKey(dateInput: Date | string): string {
  return formatApiDate(dateInput).slice(0, 7);
}

function parseMonthKey(monthKey: string): Date {
  const [year, month] = monthKey.split("-");
  return new Date(Number(year), Number(month) - 1, 1);
}

export default function Diario() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedViewCal, setSelectedViewCal] = useState(true);
  const { bookings, groupedBookings, sortedDates, isLoading } =
    useDiario();

  const bookingsByMonth = useMemo(() => {
    return bookings?.reduce<Record<string, Booking[]>>((acc, booking) => {
      const monthKey = getMonthKey(booking.booking_date);
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(booking);
      return acc;
    }, {});
  }, [bookings]);

  const sortedMonthKeys = useMemo(
    () => Object.keys(bookingsByMonth).sort((a, b) => a.localeCompare(b)),
    [bookingsByMonth],
  );

  const renderCell = (booking: Booking, columnKey: DiarioColumnKey) => {
    if (columnKey === "suit") {
      return <p>{booking.suit?.id}</p>;
    }
    return <p>{booking.observations || "-"}</p>;
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    sortedMonthKeys.forEach((monthKey, index) => {
      if (index !== 0) {
        doc.addPage();
      }

      const monthDate = parseMonthKey(monthKey);
      const monthTitle = `Reservas ${formatMonth(monthDate)}`;
      doc.setFontSize(18);
      const textWidth = doc.getTextWidth(monthTitle);
      doc.text(monthTitle, (pageWidth - textWidth) / 2, 10);

      const tableData = [...bookingsByMonth[monthKey]]
        .sort((a, b) =>
          formatApiDate(a.booking_date).localeCompare(formatApiDate(b.booking_date)),
        )
        .map((booking) => [
          toDisplayDate(booking.booking_date),
          booking.client_name,
          booking.client_phone,
          booking.suit.id,
          booking.observations || "-",
          mapBookingState(booking.booking_state),
        ]);

      autoTable(doc, {
        head: [
          [
            "Fecha",
            "Cliente",
            "Teléfono",
            "Traje",
            "Observaciones",
            "Estado de la reserva",
          ],
        ],
        body: tableData,
        startY: 20,
        margin: { top: 5, bottom: 5 },
      });
    });

    doc.save("reservas.pdf");
  };

  return (
    <>
      <Modal
        onClose={() => setSelectedBooking(null)}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
      >
        <ModalContent className="w-2/3 md:max-w-3xl">
          {selectedBooking ? (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Informacion de reserva {toDisplayDate(selectedBooking.booking_date)}
              </ModalHeader>
              <ModalBody className="flex md:flex-row md:gap-10 flex-col gap-5">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">
                    Información del Cliente
                  </h3>
                  <p>
                    <strong>Nombre:</strong> {selectedBooking.client_name}
                  </p>
                  <p>
                    <strong>DNI:</strong> {selectedBooking.client_dni}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {selectedBooking.client_phone}
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">
                    Detalles de la Reserva
                  </h3>
                  <p>
                    <strong>Fecha de Reserva:</strong>{" "}
                    {toDisplayDate(selectedBooking.booking_date)}
                  </p>
                  <p>
                    <strong>Estado de la Reserva:</strong>{" "}
                    {selectedBooking.booking_state}
                  </p>
                  <p>
                    <strong>Observaciones:</strong>{" "}
                    {selectedBooking.observations || "-"}
                  </p>
                  <p>
                    <strong>Modista:</strong> {selectedBooking.dressmaker ? "Sí" : "No"}
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-blue-700 mb-2">
                    Detalles del Traje
                  </h3>
                  <p>
                    <strong>ID del Traje:</strong> {selectedBooking.suit.id}
                  </p>
                  <p>
                    <strong>Marca:</strong> {selectedBooking.suit.brand}
                  </p>
                  <p>
                    <strong>Categoría:</strong> {selectedBooking.suit.category}
                  </p>
                  <p>
                    <strong>Talla:</strong> {selectedBooking.suit.size}
                  </p>
                  <p>
                    <strong>Color:</strong> {selectedBooking.suit.color}
                  </p>
                  <p>
                    <strong>Estado:</strong>{" "}
                    {getState(selectedBooking.suit.state as SuitState)}
                  </p>
                </div>
              </ModalBody>
            </>
          ) : (
            <div className="text-center p-4">
              <p className="text-red-500">No hay datos de la reserva disponibles.</p>
            </div>
          )}
        </ModalContent>
      </Modal>

      <div className="absolute right-4">
        <Button color="secondary" onPress={handleDownloadPDF}>
          Descargar PDF
        </Button>
      </div>

      <div className="p-3">
        <p className={TABLE_TITLE_CLASS}>Calendario de reservas</p>

        <div className="flex flex-row w-full md:w-1/2 mx-auto justify-center gap-3 mt-3">
          <Button
            className={`transition-all duration-300 ease-in-out px-4 py-2 rounded-xl ${
              selectedViewCal
                ? "bg-pastel-primary text-white border-pastel-primary shadow-lg"
                : "bg-pastel-soft text-pastel-text border-pastel-border"
            } hover:bg-pastel-primary/80 hover:text-white`}
            onPress={() => setSelectedViewCal(true)}
          >
            Vista Calendario
          </Button>
          <Button
            className={`transition-all duration-300 ease-in-out px-4 py-2 rounded-xl ${
              !selectedViewCal
                ? "bg-pastel-primary text-white border-pastel-primary shadow-lg"
                : "bg-pastel-soft text-pastel-text border-pastel-border"
            } hover:bg-pastel-primary/80 hover:text-white`}
            onPress={() => setSelectedViewCal(false)}
          >
            Vista Diaria
          </Button>
        </div>

        {!selectedViewCal ? (
          isLoading ? (
            <div className="flex justify-center mt-8">
              <Spinner color="secondary" />
            </div>
          ) : sortedDates.length === 0 ? (
            <div className="text-center mt-8">
              <p className="text-xl text-red-600">No hay reservas disponibles</p>
            </div>
          ) : (
            <div className="md:grid md:grid-cols-3 gap-3 flex flex-col px-2">
              {sortedDates.map((date) => (
                <div key={date} className="mb-2 w-full mx-auto">
                  <div className="bg-pastel-soft p-2 mt-3 rounded-lg shadow-lg border border-pastel-border">
                    <h3 className="text-2xl mb-4 text-center text-pastel-text">{`Fecha ${date}`}</h3>
                    <Table
                      color="secondary"
                      className={TABLE_WRAPPER_CLASS}
                      classNames={{
                        th: [TABLE_HEADER_CLASS],
                        tr: ["border-2", "min-h-[12px]"],
                        td: ["bg-transparent"],
                      }}
                      selectionBehavior="toggle"
                      aria-label={`Reservas del día ${date}`}
                      isHeaderSticky
                    >
                      <TableHeader>
                        <TableColumn>Traje</TableColumn>
                        <TableColumn>Observaciones</TableColumn>
                      </TableHeader>
                      <TableBody emptyContent="No hay reservas">
                        {groupedBookings[date].map((booking) => (
                          <TableRow
                            className="hover:bg-pastel-surface"
                            onClick={() => {
                              setSelectedBooking(booking);
                              onOpen();
                            }}
                            key={booking.id}
                          >
                            <TableCell>{renderCell(booking, "suit")}</TableCell>
                            <TableCell>{renderCell(booking, "observations")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <CalendarReservas />
        )}
      </div>
    </>
  );
}
