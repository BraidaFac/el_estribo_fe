"use client";
import { usePlanillas } from "@/app/planillas/hooks/usePlanillas";
import { Suit } from "@/lib/utils/suit";
import {
  ACTION_BUTTON_BASE_CLASS,
  ACTION_BUTTON_CLASSES,
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

export default function Planillas() {
  const { isLoading, error, suitsToLaundry, markLaundryDelivered, refresh } =
    usePlanillas("llevar");

  const rows = useMemo(
    () =>
      suitsToLaundry.map((suit: Suit) => ({
        suit_id: suit.id,
        suit_color: suit.color,
        actions: (
          <div className="flex flex-row gap-1 justify-center w-1/2 mx-auto">
            <Button
              size="sm"
              className={`md:max-w-26 md:min-w-26 ${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.edit}`}
              onPress={() => markLaundryDelivered(suit.id, "lucecita")}
            >
              Lucecita
            </Button>
            <Button
              size="sm"
              className={`md:max-w-26 md:min-w-26 ${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.success}`}
              onPress={() => markLaundryDelivered(suit.id, "celia")}
            >
              Celia
            </Button>
          </div>
        ),
      })),
    [markLaundryDelivered, suitsToLaundry],
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
      key: "suit_id",
      label: "Traje",
    },
    {
      key: "suit_color",
      label: "Color",
    },
    { key: "actions", label: "Acciones" },
  ];
  return (
        <div className="p-1">
          <div className="header my-3">
            <p className={TABLE_TITLE_CLASS}>Llevar lavanderia</p>
          </div>
          <div className="px-2 mx-auto">
            <Table
              aria-label="Example table with dynamic content"
              isHeaderSticky
              className={TABLE_WRAPPER_CLASS}
            >
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn className={`${TABLE_HEADER_CLASS} text-center`} key={column.key}>
                    {column.label}
                  </TableColumn>
                )}
              </TableHeader>
              <TableBody
                items={rows}
                isLoading={isLoading}
                emptyContent={
                  isLoading ? null : "No hay trajes para llevar a lavanderia"
                }
                loadingContent={<Spinner color="white" />}
              >
                {(item) => (
                  <TableRow key={item.suit_id}>
                    {(columnKey) => (
                      <TableCell className="text-center">
                        {getKeyValue(item, columnKey)}
                      </TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
  );
}
