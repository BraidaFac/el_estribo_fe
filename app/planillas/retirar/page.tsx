"use client";
import { usePlanillas } from "@/app/planillas/hooks/usePlanillas";
import { formatApiDate } from "@/lib/utils/dateOnly";
import { SuitState } from "@/lib/utils/suit";
import {
  ACTION_BUTTON_BASE_CLASS,
  ACTION_BUTTON_CLASSES,
  LAUNDRY_COLORS,
  TABLE_HEADER_CLASS,
  TABLE_TITLE_CLASS,
  TABLE_WRAPPER_CLASS,
} from "@/lib/utils/uiStyles";
import {
  Button,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from "@heroui/react";
import { useMemo } from "react";

function toDisplayDate(dateInput?: string): string {
  if (!dateInput) return "No tiene";
  const [year, month, day] = formatApiDate(dateInput).split("-");
  return `${day}/${month}/${year}`;
}

export default function RetirarLavanderia() {
  const {
    isLoading,
    error,
    suitsInLaundry,
    suitsToTakeLaundry,
    markLaundryClean,
    markSuitDeliveredFromLaundry,
    refresh,
  } = usePlanillas("retirar");

  const inLaundryRows = useMemo(
    () =>
      suitsInLaundry.map(({ suit, nextBookingDate }) => ({
        key: suit.id,
        suit_name: suit.id,
        lavanderia: (
          <div
            className={
              suit.state === SuitState.LAVANDERIALUCECITASUCIO
                ? `${LAUNDRY_COLORS.lucecita}`
                : `${LAUNDRY_COLORS.celia}`
            }
          >
            {suit.state === SuitState.LAVANDERIALUCECITASUCIO ? "Lucecita" : "Celia"}
          </div>
        ),
        soon_booking: toDisplayDate(nextBookingDate),
        actions: (
          <Button
            size="sm"
            className={`${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.success}`}
            onPress={() => markLaundryClean(suit.id, suit.state)}
          >
            Limpio
          </Button>
        ),
      })),
    [markLaundryClean, suitsInLaundry],
  );

  const toTakeRows = useMemo(
    () =>
      suitsToTakeLaundry.map(({ suit, nextBookingDate }) => ({
        key: suit.id,
        suit_name: suit.id,
        soon_booking: toDisplayDate(nextBookingDate),
        lavanderia: (
          <div
            className={
              suit.state === SuitState.LAVANDERIALUCECITALIMPIO
                ? `${LAUNDRY_COLORS.lucecita}`
                : `${LAUNDRY_COLORS.celia}`
            }
          >
            {suit.state === SuitState.LAVANDERIALUCECITALIMPIO ? "Lucecita" : "Celia"}
          </div>
        ),
        actions: (
          <Button
            size="sm"
            className={`${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.edit}`}
            onPress={() => markSuitDeliveredFromLaundry(suit.id)}
          >
            Entregado
          </Button>
        ),
      })),
    [markSuitDeliveredFromLaundry, suitsToTakeLaundry],
  );

  if (error) {
    return (
      <div className="text-center space-y-3">
        <p className="text-red-600 text-xl">{error}</p>
        <Button color="primary" onPress={refresh}>
          Reintentar
        </Button>
      </div>
    );
  }

  const columns = [
    {
      key: "suit_name",
      label: "Traje",
    },
    {
      key: "lavanderia",
      label: "Lavanderia",
    },
    { key: "soon_booking", label: "Proxima reserva" },
    { key: "actions", label: "Acciones" },
  ];
  return (
    <>
      {isLoading ? (
        <div className="text-center">
          <Spinner color="danger"></Spinner>
        </div>
      ) : (
        <main className="flex flex-col w-full">
          <div className="w-full px-1">
            <div className="header my-3">
              <p className={TABLE_TITLE_CLASS}>Retirar lavanderia</p>
            </div>
            <div className="">
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
                  items={toTakeRows}
                  isLoading={isLoading}
                  emptyContent={
                    isLoading
                      ? null
                      : "No hay trajes para retirar de lavanderia"
                  }
                  loadingContent={<Spinner color="white" />}
                >
                  {(item) => (
                    <TableRow key={item.suit_name}>
                      {(columnKey) => (
                        <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="w-full p-1">
            <div className="header my-3">
              <p className={TABLE_TITLE_CLASS}>Trajes en lavanderia</p>
            </div>
            <div className="">
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
                  items={inLaundryRows}
                  isLoading={isLoading}
                  emptyContent={
                    isLoading ? null : "No hay trajes  en lavanderia"
                  }
                  loadingContent={<Spinner color="white" />}
                >
                  {(item) => (
                    <TableRow key={item.suit_name}>
                      {(columnKey) => (
                        <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      )}
    </>
  );
}
