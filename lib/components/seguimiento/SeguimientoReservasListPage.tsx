"use client";

import { getEstadoReservaLabel } from "@/lib/domain/reservas/labels";
import type { Reserva } from "@/lib/domain/reservas/types";
import {
  listarHistorialReservas,
  type HistorialReservasFiltros,
} from "@/lib/services/v2/reservas-v2.service";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import { formatApiDateForUi, formatApiDateTimeForUi } from "@/lib/utils/formatApiDate";
import { TABLE_HEADER_CLASS } from "@/lib/utils/uiStyles";
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
} from "@heroui/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 30;

export function SeguimientoReservasListPage() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Reserva[]>([]);
  const [total, setTotal] = useState(0);
  /** Valor en el input (borrador). */
  const [buscarInput, setBuscarInput] = useState("");
  /** Valor aplicado al API (solo cambia con Aplicar o Limpiar). */
  const [buscarAplicado, setBuscarAplicado] = useState("");

  const filtrosForApi = useMemo((): HistorialReservasFiltros => {
    const t = buscarAplicado.trim();
    return t ? { buscar: t } : {};
  }, [buscarAplicado]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await listarHistorialReservas(page, PAGE_SIZE, filtrosForApi);
      setItems(r.items);
      setTotal(r.total);
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, filtrosForApi]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const aplicarBusqueda = () => {
    setBuscarAplicado(buscarInput.trim());
    setPage(1);
  };

  const limpiarBusqueda = () => {
    setBuscarInput("");
    setBuscarAplicado("");
    setPage(1);
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="rounded-lg border border-pastel-border bg-pastel-surface p-4">
        <h1 className="text-2xl font-semibold text-pastel-text">Seguimiento de reservas</h1>
        <p className="mt-1 text-sm text-pastel-text/80">
          Listado histórico de reservas. Podés abrir el detalle de cada una.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <Input
            className="min-w-0 flex-1 sm:max-w-xl"
            label="Buscar"
            placeholder="Nº reserva, cliente, DNI, código saco o pantalón…"
            value={buscarInput}
            onValueChange={setBuscarInput}
            size="sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") aplicarBusqueda();
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" color="primary" onPress={aplicarBusqueda}>
              Buscar
            </Button>
            <Button size="sm" variant="flat" onPress={limpiarBusqueda}>
              Limpiar
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner color="secondary" />
        </div>
      ) : (
        <>
          <Table aria-label="Historial de reservas">
            <TableHeader>
              <TableColumn className={TABLE_HEADER_CLASS}>Nº</TableColumn>
              <TableColumn className={TABLE_HEADER_CLASS}>Alta</TableColumn>
              <TableColumn className={TABLE_HEADER_CLASS}>Fecha evento</TableColumn>
              <TableColumn className={TABLE_HEADER_CLASS}>Cliente</TableColumn>
              <TableColumn className={TABLE_HEADER_CLASS}>Estado</TableColumn>
              <TableColumn className={TABLE_HEADER_CLASS}>Saco</TableColumn>
              <TableColumn className={TABLE_HEADER_CLASS}>&nbsp;</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No hay reservas registradas.">
              {items.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>#{r.id}</TableCell>
                  <TableCell>
                    {r.createdAt ? formatApiDateTimeForUi(r.createdAt) : "—"}
                  </TableCell>
                  <TableCell>{formatApiDateForUi(r.fechaReserva)}</TableCell>
                  <TableCell>{r.clienteNombre}</TableCell>
                  <TableCell>{getEstadoReservaLabel(r.estadoReserva)}</TableCell>
                  <TableCell>{`${r.saco.codigo} (${r.saco.marca})`}</TableCell>
                  <TableCell>
                    <Button
                      as={Link}
                      href={`/seguimiento-reservas/${r.id}`}
                      size="sm"
                      color="primary"
                      variant="flat"
                    >
                      Ver detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-pastel-border pt-4 text-sm text-pastel-text/80">
            <span>
              Página {page} de {totalPages} · {total} reservas en total
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="flat"
                isDisabled={page <= 1}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="flat"
                isDisabled={page >= totalPages}
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
