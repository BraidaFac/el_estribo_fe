"use client";
import { usePlanillas } from "@/app/planillas/hooks/usePlanillas";
import ConfirmationModal from "@/lib/components/ConfirmModal";
import { formatApiDate } from "@/lib/utils/dateOnly";
import { getState, SuitState } from "@/lib/utils/suit";
import {
  ACTION_BUTTON_BASE_CLASS,
  ACTION_BUTTON_CLASSES,
  TABLE_HEADER_CLASS,
  TABLE_TITLE_CLASS,
  TABLE_WRAPPER_CLASS,
} from "@/lib/utils/uiStyles";
import {
  Button,
  Chip,
  getKeyValue,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useMemo, useRef, useState } from "react";

// Define un tipo para los colores válidos
type StatusColor = "success" | "danger" | "warning" | "primary";

// Define el objeto mapeado con claves de SuitState y valores de StatusColor
const statusColorMap: { [key in SuitState]: StatusColor } = {
  [SuitState.ENLOCALLIMPIO]: "warning",
  [SuitState.ENLOCALSUCIO]: "danger",
  [SuitState.LAVANDERIACELIALIMPIO]: "danger",
  [SuitState.LAVANDERIACELIASUCIO]: "danger",
  [SuitState.LAVANDERIALUCECITALIMPIO]: "danger",
  [SuitState.LAVANDERIALUCECITASUCIO]: "danger",
  [SuitState.MODISTA]: "primary",
  [SuitState.RETIRADO]: "primary",
  [SuitState.LISTOENTREGA]: "success",
};
type ActionType = () => Promise<void>;
// Define el tipo de referencia para el modal
type ConfirmationModalRef = {
  openModal: () => Promise<boolean>;
};

function toDisplayDate(dateInput: Date | string): string {
  const [year, month, day] = formatApiDate(dateInput).split("-");
  return `${day}/${month}/${year}`;
}

export default function Retiros() {
  const {
    isLoading,
    error,
    nearBookings,
    refresh,
    markBookingRetired,
    sendSuitToDressmaker,
    markSuitReadyToDeliver,
  } = usePlanillas("retiros");
  const [filteredBookings, setFilteredBookings] = useState<
    | {
        key: number;
        client_name: string;
        client_phone: string;
        suit: string;
        suit_state: string;
        dress_maker: string;
        observation: string;
        booking_date: string;
        actions: JSX.Element;
      }[]
    | undefined
  >(undefined);

  const modalRef = useRef<ConfirmationModalRef>(null); // Referencia para el modal

  const handleActionWithConfirmation = async (action: ActionType) => {
    const confirmed = await modalRef.current!.openModal(); // Abre el modal y espera la confirmación
    if (confirmed) {
      await action(); // Ejecuta la acción si el usuario confirma
    }
  };

  const rows = useMemo(
    () =>
      nearBookings.map((booking) => ({
        key: booking.id,
        client_name: booking.client_name,
        client_phone: booking.client_phone,
        suit: booking.suit.id,
        suit_state: booking.suit.state,
        dress_maker: booking.dressmaker ? "Si" : "No",
        observation: booking.observations,
        booking_date: toDisplayDate(booking.booking_date),
        actions:
          booking.suit.state === SuitState.LAVANDERIACELIASUCIO ||
          booking.suit.state === SuitState.LAVANDERIALUCECITASUCIO ||
          booking.suit.state === SuitState.LAVANDERIALUCECITALIMPIO ||
          booking.suit.state === SuitState.LAVANDERIACELIALIMPIO ||
          booking.suit.state === SuitState.RETIRADO ||
          booking.suit.state === SuitState.ENLOCALSUCIO ? (
            <div />
          ) : booking.suit.state === SuitState.LISTOENTREGA ? (
            <div className="flex flex-row justify-center">
              <Button
                size="sm"
                className={`p-2 min-w-6 ${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.edit}`}
                onClick={() =>
                  handleActionWithConfirmation(() => markBookingRetired(booking.id))
                }
              >
                Retiró
              </Button>
            </div>
          ) : booking.suit.state === SuitState.MODISTA ? (
            <div className="flex flex-row gap-1 justify-center">
              <Button
                size="sm"
                className={`p-1 min-w-6 ${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.success}`}
                onClick={() =>
                  handleActionWithConfirmation(() =>
                    markSuitReadyToDeliver(booking.suit.id),
                  )
                }
              >
                Traje Listo
              </Button>
            </div>
          ) : (
            <div className="flex flex-row gap-1 justify-center">
              <Button
                size="sm"
                className={`p-2 min-w-6 ${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.neutral}`}
                onClick={() =>
                  handleActionWithConfirmation(() =>
                    sendSuitToDressmaker(booking.suit.id),
                  )
                }
              >
                Modista
              </Button>
              <Button
                size="sm"
                className={`p-1 min-w-6 ${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.success}`}
                onClick={() =>
                  handleActionWithConfirmation(() =>
                    markSuitReadyToDeliver(booking.suit.id),
                  )
                }
              >
                Traje Listo
              </Button>
            </div>
          ),
      })),
    [
      markBookingRetired,
      markSuitReadyToDeliver,
      nearBookings,
      sendSuitToDressmaker,
    ],
  );


  const handleSearch = (value: string) => {
    if (!value) {
      setFilteredBookings(rows);
    }
    let searchTermLower = value.toLowerCase();
    const filtered = rows?.filter(
      (booking) =>
        booking.suit.toLowerCase().includes(searchTermLower) ||
        booking.client_name.toLowerCase().includes(searchTermLower) ||
        booking.client_phone.toLowerCase().includes(searchTermLower),
    );
    setFilteredBookings(filtered);
  };

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

  const columns = [
    {
      key: "client_name",
      label: "Cliente",
    },
    {
      key: "client_phone",
      label: "Telefono",
    },
    {
      key: "suit",
      label: "Traje",
    },
    {
      key: "suit_state",
      label: "Estado del traje",
    },
    {
      key: "booking_date",
      label: "Fecha de reserva",
    },
    {
      key: "dress_maker",
      label: "Modista",
    },
    { key: "observation", label: "Observaciones" },
    {
      key: "actions",
      label: "Acciones",
    },
  ];
  return (
    <>
      <ConfirmationModal
        ref={modalRef}
        message="¿Está seguro de realizar esta acción?"
      />
      {!isLoading ? (
        <div className="p-1">
          <div className="header my-3">
            <p className={TABLE_TITLE_CLASS}>Proximos retiros</p>
            <Input
              placeholder="Filtrar por traje, nombre o teléfono"
              onValueChange={(value) => {
                handleSearch(value);
              }}
              className="mb-4 px-4"
            />
          </div>
          <Table
            aria-label="Example table with dynamic content"
            isHeaderSticky
            className={TABLE_WRAPPER_CLASS}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn className={`${TABLE_HEADER_CLASS} p-2`} key={column.key}>
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={filteredBookings || rows}
              isLoading={isLoading}
              emptyContent={isLoading ? null : "No hay reservas proximas"}
              loadingContent={<Spinner color="white" />}
            >
              {(item) => (
                <TableRow key={item.key}>
                  {(columnKey) => (
                    <TableCell className="p-1">
                      {columnKey === "suit_state" ? (
                        <Chip
                          className="p-0"
                          color={statusColorMap[item.suit_state as SuitState]}
                        >
                          {getState(item.suit_state as SuitState)}
                        </Chip>
                      ) : (
                        getKeyValue(item, columnKey)
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center">
          <Spinner color="danger"></Spinner>
        </div>
      )}
    </>
  );
}
