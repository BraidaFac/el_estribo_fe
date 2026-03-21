"use client";

import { ApiDateField } from "@/lib/components/ui/ApiDateField";
import { getEstadoBloqueoLabel, getTipoBloqueoLabel } from "@/lib/domain/reservas/labels";
import { BloqueoPrenda } from "@/lib/domain/reservas/types";
import type { PlanillaOperacionesMode } from "@/lib/planillas/planillaOperacionesConfig";
import { listarBloqueosPorPrenda } from "@/lib/services/v2";
import { formatApiDateTimeForUi } from "@/lib/utils/formatApiDate";
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
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type PlanillaBloqueosPageProps = {
  title: string;
  mode: PlanillaOperacionesMode;
};

function matchesMode(mode: PlanillaOperacionesMode, bloqueo: BloqueoPrenda): boolean {
  if (mode === "LLEVAR_LAVANDERIA") {
    return bloqueo.tipoBloqueo === "LAVANDERIA" && bloqueo.estado === "ACTIVO";
  }
  if (mode === "RETIRAR_LAVANDERIA") {
    return bloqueo.tipoBloqueo === "LAVANDERIA";
  }
  if (mode === "RETIROS_CLIENTES") {
    return bloqueo.tipoBloqueo === "RESERVA" && bloqueo.estado === "ACTIVO";
  }
  return bloqueo.tipoBloqueo === "RESERVA";
}

export function PlanillaBloqueosPage({ title, mode }: PlanillaBloqueosPageProps) {
  const [sacoIdInput, setSacoIdInput] = useState("");
  const [desde, setDesde] = useState(format(new Date(), "yyyy-MM-01"));
  const [hasta, setHasta] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isLoading, setIsLoading] = useState(false);
  const [bloqueos, setBloqueos] = useState<BloqueoPrenda[]>([]);

  const sacoId = Number(sacoIdInput);
  const canSearch = Number.isInteger(sacoId) && sacoId > 0 && !!desde && !!hasta;

  const visibleRows = useMemo(
    () => bloqueos.filter((bloqueo) => matchesMode(mode, bloqueo)),
    [bloqueos, mode],
  );

  const handleSearch = async () => {
    if (!canSearch) {
      toast.error("Selecciona saco, desde y hasta para continuar");
      return;
    }

    try {
      setIsLoading(true);
      const data = await listarBloqueosPorPrenda("SACO", sacoId, desde, hasta);
      setBloqueos(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo cargar la planilla",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="rounded-lg border border-pastel-border bg-pastel-surface p-4">
        <h1 className="text-2xl font-semibold text-pastel-text">{title}</h1>
        <p className="mt-1 text-sm text-pastel-text/80">
          Vista operativa basada en bloqueos reales del backend.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input
            type="number"
            label="Saco ID"
            placeholder="Ej: 12"
            value={sacoIdInput}
            onValueChange={setSacoIdInput}
          />
          <ApiDateField label="Desde" value={desde} onChange={setDesde} />
          <ApiDateField label="Hasta" value={hasta} onChange={setHasta} />
          <Button
            color="primary"
            className="self-end"
            isDisabled={!canSearch}
            onPress={handleSearch}
          >
            Cargar planilla
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-28 items-center justify-center">
          <Spinner color="secondary" />
        </div>
      ) : (
        <Table aria-label={title}>
          <TableHeader>
            <TableColumn className={TABLE_HEADER_CLASS}>ID</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Tipo</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Estado</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Inicio</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Fin</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Reserva</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Lavanderia</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Modista</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay registros para el filtro actual">
            {visibleRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{getTipoBloqueoLabel(row.tipoBloqueo)}</TableCell>
                <TableCell>{getEstadoBloqueoLabel(row.estado)}</TableCell>
                <TableCell>{formatApiDateTimeForUi(row.inicio)}</TableCell>
                <TableCell>{formatApiDateTimeForUi(row.fin)}</TableCell>
                <TableCell>{row.reserva?.id ?? "-"}</TableCell>
                <TableCell>{row.lavanderia?.nombre ?? "-"}</TableCell>
                <TableCell>{row.modista?.nombre ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
