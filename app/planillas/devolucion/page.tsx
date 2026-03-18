"use client";
import { usePlanillas } from "@/app/planillas/hooks/usePlanillas";
import { formatApiDate } from "@/lib/utils/dateOnly";
import {
  ACTION_BUTTON_BASE_CLASS,
  ACTION_BUTTON_CLASSES,
  TABLE_HEADER_CLASS,
  TABLE_TITLE_CLASS,
  TABLE_WRAPPER_CLASS,
} from "@/lib/utils/uiStyles";
import {
  Button,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from "@heroui/react";
import { useMemo, useState } from "react";

function toDisplayDate(dateInput?: string): string {
  if (!dateInput) return "No tiene";
  const [year, month, day] = formatApiDate(dateInput).split("-");
  return `${day}-${month}-${year}`;
}

export default function Devolucion() {
  const { isLoading, error, bookingsToReturn, markBookingReturned, refresh } =
    usePlanillas("devolucion");
  const [filteredBookings, setFilteredBookings] = useState<
    | {
        key: number;
        suit_id: string;
        client_name: string;
        client_phone: string;
        next_booking_date: string;
        booking_date: string;
        actions: JSX.Element;
      }[]
    | undefined
  >(undefined);

  const rows = useMemo(
    () =>
      bookingsToReturn.map(({ booking, nextBookingDate }) => ({
        key: booking.id,
        suit_id: booking.suit.id,
        client_name: booking.client_name,
        client_phone: booking.client_phone,
        booking_date: toDisplayDate(formatApiDate(booking.booking_date)),
        next_booking_date: toDisplayDate(nextBookingDate),
        actions: (
          <Button
            size="sm"
            className={`w-8 ${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.success}`}
            onClick={() => markBookingReturned(booking.id)}
          >
            Devuelto
          </Button>
        ),
      })),
    [bookingsToReturn, markBookingReturned],
  );

  const handleSearch = (value: string) => {
    if (value === "") {
      setFilteredBookings(rows);
      return;
    }
    const searchTermLower = value.toLowerCase();
    const filtered = rows.filter(
      (booking) =>
        booking.suit_id.toLowerCase().includes(searchTermLower) ||
        booking.client_name.toLowerCase().includes(searchTermLower) ||
        booking.client_phone.toLowerCase().includes(searchTermLower),
    );
    setFilteredBookings(filtered);
  };

  const columns = [
    { key: "suit_id", label: "Traje" },
    { key: "client_name", label: "Nombre" },
    { key: "client_phone", label: "Telefono" },
    { key: "next_booking_date", label: "Proxima reserva" },
    { key: "booking_date", label: "Fecha Reserva" },
    { key: "actions", label: "Acciones" },
  ];

  if (error) {
    return (
      <div className="text-center space-y-3">
        <p className="text-red-600 text-xl">{error}</p>
        <Button color="primary" onClick={refresh}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <>
        <div>
          <div className="p-1">
            <div className="header my-3">
              <p className={TABLE_TITLE_CLASS}>Recordar devolucion</p>
            <Input
              
                placeholder="Filtrar por traje, nombre o teléfono"
                onValueChange={(value) => {
                  handleSearch(value);
                }}
                className="mb-4 px-4"
              />
            </div>
            <div>
              <Table
                aria-label="Example table with dynamic content"
                isHeaderSticky
                className={TABLE_WRAPPER_CLASS}
              >
                <TableHeader columns={columns}>
                  {(column) => (
                    <TableColumn key={column.key} className={TABLE_HEADER_CLASS}>
                      {column.label}
                    </TableColumn>
                  )}
                </TableHeader>
                <TableBody
                  items={filteredBookings || rows}
                  isLoading={isLoading}
                  emptyContent={
                    isLoading ? null : "No hay trajes para devolver"
                  }
                  loadingContent={<Spinner color="white" />}
                >
                  {(item) => (
                    <TableRow key={item.key}>
                      {(columnKey) => (
                        <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
    </>
  );
}
