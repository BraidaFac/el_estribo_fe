"use client";

import type {
  Lavanderia,
  TareaLavanderiaItem,
} from "@/lib/domain/reservas/types";
import { listarLavanderias } from "@/lib/services/v2/lavanderias-v2.service";
import {
  enviarLavanderiaLote,
  listarTareasLavanderia,
} from "@/lib/services/v2/tareas-operativas-v2.service";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import { formatApiDateForUi } from "@/lib/utils/formatApiDate";
import { generarPdfLlevarLavanderia } from "@/lib/utils/pdf/lavanderiaPdf";
import { TABLE_HEADER_CLASS } from "@/lib/utils/uiStyles";
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
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
import { useCallback, useEffect, useState } from "react";
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

const DECISION_LABEL: Record<string, string> = {
  LAVANDERIA_EXTERNA: "Lav. externa",
  LIMPIEZA_LOCAL: "Limpieza local",
};

export function PlanillaLlevarLavanderiaPage() {
  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState<TareaLavanderiaItem[]>([]);
  const [lavanderias, setLavanderias] = useState<Lavanderia[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [lavanderiaSelId, setLavanderiaSelId] = useState<string>("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [tareasData, lavs] = await Promise.all([
        listarTareasLavanderia({ tipo: "llevar" }),
        listarLavanderias(),
      ]);
      setTareas(tareasData);
      setLavanderias(lavs);
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

  const handleEnviar = async () => {
    const lavanderiaId = Number(lavanderiaSelId);
    if (!lavanderiaId) {
      toast.error("Seleccioná una lavandería");
      return;
    }
    const ids = Array.from(selectedIds);
    try {
      setSending(true);
      await enviarLavanderiaLote({ ids, lavanderiaId });
      const lav = lavanderias.find((l) => l.id === lavanderiaId);
      const hoy = new Date().toISOString().slice(0, 10);
      const prendasEnviadas = tareas.filter((t) => ids.includes(t.id));
      toast.success(
        `${ids.length} prenda(s) enviadas a ${lav?.nombre ?? "lavandería"}`,
      );
      setModalOpen(false);
      setLavanderiaSelId("");
      await generarPdfLlevarLavanderia(
        prendasEnviadas,
        lav?.nombre ?? "Lavandería",
        hoy,
      );
      await load();
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
    } finally {
      setSending(false);
    }
  };

  const allSelected = tareas.length > 0 && selectedIds.size === tareas.length;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="rounded-lg border border-pastel-border bg-pastel-surface p-4">
        <h1 className="text-2xl font-semibold text-pastel-text">
          Llevar Lavandería
        </h1>
        <p className="mt-1 text-sm text-pastel-text/80">
          Seleccioná las prendas a enviar, elegí la lavandería y generá el
          remito PDF.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Button
            color="default"
            variant="flat"
            isDisabled={tareas.length === 0}
            onPress={toggleAll}
          >
            {allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
          </Button>
          <div />
          <Button
            color="primary"
            isDisabled={selectedIds.size === 0}
            onPress={() => setModalOpen(true)}
          >
            Enviar seleccionados ({selectedIds.size})
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-28 items-center justify-center">
          <Spinner color="secondary" />
        </div>
      ) : (
        <Table aria-label="Prendas para llevar a lavandería">
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
            <TableColumn className={TABLE_HEADER_CLASS}>
              Recomendación
            </TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>
              Próx. Reserva
            </TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Prioridad</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay prendas pendientes de envío a lavandería.">
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
                <TableCell>
                  {t.decisionLavado
                    ? (DECISION_LABEL[t.decisionLavado] ?? t.decisionLavado)
                    : "-"}
                </TableCell>
                <TableCell>
                  {formatApiDateForUi(t.proximaReservaFecha)}
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} size="sm">
        <ModalContent>
          <ModalHeader>Seleccioná la Lavandería</ModalHeader>
          <ModalBody>
            <p className="text-sm text-pastel-text/80 mb-3">
              Se enviarán <strong>{selectedIds.size}</strong> prenda(s) a:
            </p>
            <Select
              label="Lavandería"
              placeholder="Elegir lavandería"
              selectedKeys={lavanderiaSelId ? [lavanderiaSelId] : []}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0];
                setLavanderiaSelId(val ? String(val) : "");
              }}
              size="sm"
            >
              {lavanderias.map((lav) => (
                <SelectItem key={String(lav.id)}>{lav.nombre}</SelectItem>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => setModalOpen(false)}
              isDisabled={sending}
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              isLoading={sending}
              isDisabled={!lavanderiaSelId}
              onPress={() => void handleEnviar()}
            >
              Enviar y generar PDF
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
