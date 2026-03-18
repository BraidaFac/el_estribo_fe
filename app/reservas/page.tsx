"use client";
import { useAppContext } from "@/lib/components/AppContext";
import { listBookingsByDateDesc } from "@/lib/services/booking.service";
import { Booking, mapBookingState, stateColorMap } from "@/lib/utils/booking";
import { TABLE_HEADER_CLASS, TABLE_TITLE_CLASS } from "@/lib/utils/uiStyles";
import {
  Chip,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { format } from "date-fns/esm";
import { useRouter } from "next/navigation";
import { Key, useCallback, useEffect, useState } from "react";

type ColumnKey =
  | "client_name"
  | "account_related"
  | "suit"
  | "booking_date"
  | "booking_retired_suit"
  | "booking_return_suit"
  | "booking_state";

const columns: { name: string; uid: ColumnKey }[] = [
  {
    name: "Cliente",
    uid: "client_name",
  },
  {
    name: "Cuenta asociada",
    uid: "account_related",
  },
  {
    name: "Traje",
    uid: "suit",
  },

  {
    name: "Fecha de reserva",
    uid: "booking_date",
  },
  {
    name: "Fecha de retiro",
    uid: "booking_retired_suit",
  },
  {
    name: "Fecha de devolucion",
    uid: "booking_return_suit",
  },
  {
    name: "Estado",
    uid: "booking_state",
  },
];

export default function Reservas() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { isLoading, setIsLoading, setError } = useAppContext();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setBookings(await listBookingsByDateDesc());
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Error al cargar las reservas",
        );
      }
    };
    fetchBookings();
  }, [setError]);
  /*  const {
    data: bookings,
    error,
    mutate,
    isLoading: isBookingsLoading = true,
  } = useSWR<Booking[]>(
    `${process.env.NEXT_PUBLIC_API_BACKEND}/booking`,
    listBookingsByDateDesc,
  );
 */
  /*  const visibleBookings = useMemo(() => {
    if (!bookings) return [];
    if (!search.trim()) return bookings;

    const searchTermLower = search.toLowerCase();
    return bookings.filter(
      (booking) =>
        booking.suit.id.toLowerCase().includes(searchTermLower) ||
        booking.client_name.toLowerCase().includes(searchTermLower) ||
        booking.client_phone.toLowerCase().includes(searchTermLower) ||
        booking.client_dni.toLowerCase().includes(searchTermLower),
    );
  }, [bookings, search]); */

  const renderCell = useCallback((booking: Booking, columnKey: Key) => {
    const key = String(columnKey) as ColumnKey;

    switch (key) {
      case "client_name":
        return <p>{booking.client_name}</p>;
      case "account_related":
        return <p>{booking.account_related}</p>;
      case "booking_date":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">
              {format(new Date(booking.booking_date), "dd/MM/yyyy")}
            </p>
          </div>
        );
      case "suit":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{booking.suit.id}</p>
          </div>
        );
      case "booking_retired_suit":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">
              {booking.booking_retired_suit
                ? format(new Date(booking.booking_retired_suit), "dd/MM/yyyy")
                : "No retirado"}
            </p>
          </div>
        );
      case "booking_return_suit":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">
              {booking.booking_return_suit
                ? format(new Date(booking.booking_return_suit), "dd/MM/yyyy")
                : "No devuelto"}
            </p>
          </div>
        );

      case "booking_state":
        return (
          <Chip
            className="capitalize"
            color={stateColorMap[booking.booking_state]}
            size="sm"
            variant="flat"
          >
            {mapBookingState(booking.booking_state)}
          </Chip>
        );
      default:
        return null;
    }
  }, []);

  return (
    <div className="p-3">
      <p className={`${TABLE_TITLE_CLASS} mb-3`}>Historial reservas</p>
      <Input
        placeholder="Filtrar por traje, nombre o teléfono"
        onValueChange={setSearch}
        className="mb-4"
      />
      <Table isHeaderSticky>
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align="start" className={TABLE_HEADER_CLASS}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={bookings}
          isLoading={isLoading}
          emptyContent={isLoading ? null : "No hay reservas"}
          loadingContent={<Spinner color="white" />}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
