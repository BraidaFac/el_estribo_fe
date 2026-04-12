"use client";

import type {
  Lavanderia,
  TareaLavanderiaItem,
} from "@/lib/domain/reservas/types";
import { listarLavanderias } from "@/lib/services/v2/lavanderias-v2.service";
import {
  listarTareasLavanderia,
  retirarLavanderiaLote,
} from "@/lib/services/v2/tareas-operativas-v2.service";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import { formatApiDateForUi } from "@/lib/utils/formatApiDate";
import { subDays } from "date-fns";
import { TABLE_HEADER_CLASS } from "@/lib/utils/uiStyles";
import {
  Button,
  Chip,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const PRIORIDAD_COLOR: Record<string, "danger" | "warning" | "secondary"> = {
  ALTA: "danger",
  MEDIA: "warning",
  BAJA: "secondary",
};

const PRENDA_LABEL: Record<string, string> = {
  SACO: "Saco",
  PANTALON: "Pantalón",
};

export function PlanillaRetirarLavanderiaPage() {
  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState<TareaLavanderiaItem[]>([]);
  const [lavanderias, setLavanderias] = useState<Lavanderia[]>([]);
  const [filtroLavanderiaId, setFiltroLavanderiaId] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const lavanderiasRef = useRef<Lavanderia[]>([]);

  const load = useCallback(async (lavanderiaId?: number) => {
    try {
      setLoading(true);
      const [tareasData, lavs] = await Promise.all([
        listarTareasLavanderia({ tipo: "retirar", lavanderiaId }),
        lavanderiasRef.current.length === 0
          ? listarLavanderias()
          : Promise.resolve(lavanderiasRef.current),
      ]);
      setTareas(tareasData);
      if (lavanderiasRef.current.length === 0) {
        lavanderiasRef.current = lavs as Lavanderia[];
        setLavanderias(lavs as Lavanderia[]);
      }
      setSelectedIds(new Set());
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleFiltroChange = (val: string) => {
    setFiltroLavanderiaId(val);
    void load(val ? Number(val) : undefined);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === tareas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(Array.from(tareas, (t) => t.id)));
    }
  };

  const handleRetirar = async () => {
    const ids = Array.from(selectedIds);
    try {
      setSaving(true);
      await retirarLavanderiaLote({ ids });
      toast.success(`${ids.length} prenda(s) retiradas de lavandería`);
      await load(filtroLavanderiaId ? Number(filtroLavanderiaId) : undefined);
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const allSelected = tareas.length > 0 && selectedIds.size === tareas.length;
  const filterActive = filtroLavanderiaId !== "";

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="rounded-lg border border-pastel-border bg-pastel-surface p-4">
        <h1 className="text-2xl font-semibold text-pastel-text">
          Retirar Lavandería
        </h1>
        <p className="mt-1 text-sm text-pastel-text/80">
          Filtrá por lavandería, seleccioná las prendas recibidas y registrá el
          retiro.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Select
            label="Filtrar por lavandería"
            placeholder="Todas"
            selectedKeys={filtroLavanderiaId ? [filtroLavanderiaId] : []}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0];
              handleFiltroChange(val ? String(val) : "");
            }}
            size="sm"
          >
            {lavanderias.map((lav) => (
              <SelectItem key={String(lav.id)}>{lav.nombre}</SelectItem>
            ))}
          </Select>
          {filterActive ? (
            <Button
              color="default"
              variant="flat"
              isDisabled={tareas.length === 0}
              onPress={toggleAll}
            >
              {allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
            </Button>
          ) : (
            <div />
          )}
          <Button
            color="primary"
            isDisabled={selectedIds.size === 0}
            isLoading={saving}
            onPress={() => void handleRetirar()}
          >
            Retirar seleccionados ({selectedIds.size})
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-28 items-center justify-center">
          <Spinner color="secondary" />
        </div>
      ) : (
        <Table aria-label="Prendas para retirar de lavandería">
          <TableHeader>
            <TableColumn className={TABLE_HEADER_CLASS} width={40}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="cursor-pointer"
              />
            </TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Tipo</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Código</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Lavandería</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Ingreso</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>
              Próx. Reserva
            </TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>
              F. Sugerida Entrega
            </TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Prioridad</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay prendas pendientes de retiro desde lavandería.">
            {tareas.map((t) => (
              <TableRow
                key={t.id}
                className="cursor-pointer"
                onClick={() => toggleSelect(t.id)}
              >
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(t.id)}
                    onChange={() => toggleSelect(t.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-pointer"
                  />
                </TableCell>
                <TableCell>
                  {t.tipoPrenda
                    ? (PRENDA_LABEL[t.tipoPrenda] ?? t.tipoPrenda)
                    : "-"}
                </TableCell>
                <TableCell className="font-mono font-semibold">
                  {t.codigoPrenda ?? "-"}
                </TableCell>
                <TableCell>{t.lavanderiaNombre ?? "-"}</TableCell>
                <TableCell>
                  {formatApiDateForUi(t.fechaIngresoLavanderia)}
                </TableCell>
                <TableCell>
                  {formatApiDateForUi(t.proximaReservaFecha)}
                </TableCell>
                <TableCell>
                  {t.proximaReservaFecha
                    ? formatApiDateForUi(
                        subDays(new Date(`${t.proximaReservaFecha}`), 7)
                          .toISOString()
                          .slice(0, 10),
                      )
                    : "-"}
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    color={PRIORIDAD_COLOR[t.prioridad] ?? "secondary"}
                    className="text-pastel-text"
                  >
                    {t.prioridad}
                  </Chip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
