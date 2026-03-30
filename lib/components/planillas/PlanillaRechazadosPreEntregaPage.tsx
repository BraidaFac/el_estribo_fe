"use client";

import ConfirmModal from "@/lib/components/ConfirmModal";
import { getEstadoControlPreEntregaLabel } from "@/lib/domain/reservas/labels";
import type { RechazoPreEntregaFila } from "@/lib/domain/control-pre-entrega/types";
import { cancelarReservaV2 } from "@/lib/services/v2/reservas-v2.service";
import {
  fetchRechazadosPreEntrega,
  resolverRechazoPreEntrega,
} from "@/lib/services/v2/control-pre-entrega-v2.service";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import { formatApiDateForUi } from "@/lib/utils/formatApiDate";
import { TABLE_HEADER_CLASS } from "@/lib/utils/uiStyles";
import { useConfirmDestructive } from "@/lib/hooks/useConfirmDestructive";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
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

export function PlanillaRechazadosPreEntregaPage() {
  const { confirmModalRef, confirmDestructive } = useConfirmDestructive();
  const [loading, setLoading] = useState(true);
  const [filas, setFilas] = useState<RechazoPreEntregaFila[]>([]);
  const [resolverOpen, setResolverOpen] = useState(false);
  const [resolverControlId, setResolverControlId] = useState<number | null>(null);
  const [resolverNombre, setResolverNombre] = useState("");
  const [resolverSaving, setResolverSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchRechazadosPreEntrega();
      setFilas(data);
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const abrirResolver = (fila: RechazoPreEntregaFila) => {
    setResolverControlId(fila.id);
    setResolverNombre("");
    setResolverOpen(true);
  };

  const ejecutarResolver = async () => {
    if (resolverControlId == null || !resolverNombre.trim()) {
      toast.error("Indique quién resuelve");
      return;
    }
    try {
      setResolverSaving(true);
      await resolverRechazoPreEntrega(resolverControlId, resolverNombre.trim());
      toast.success("Marcado como listo para entregar");
      setResolverOpen(false);
      await load();
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
    } finally {
      setResolverSaving(false);
    }
  };

  const solicitarCancelar = (fila: RechazoPreEntregaFila) => {
    void confirmDestructive({
      title: "Cancelar reserva",
      message: `¿Cancelar la reserva #${fila.reservaId}?`,
      confirmText: "Cancelar reserva",
      variant: "danger",
      action: async () => {
        await cancelarReservaV2(fila.reservaId);
        toast.success("Reserva cancelada");
        await load();
      },
    });
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <ConfirmModal ref={confirmModalRef} />

      <Modal isOpen={resolverOpen} onOpenChange={setResolverOpen} backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Listo para entregar</ModalHeader>
              <ModalBody className="gap-3">
                <p className="text-sm text-pastel-text/80">
                  El problema fue corregido manualmente. Se registrará la resolución en el mismo
                  control y la reserva quedará lista para entregar.
                </p>
                <Input
                  label="Resuelto por"
                  value={resolverNombre}
                  onValueChange={setResolverNombre}
                  placeholder="Nombre de quien confirma"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cerrar
                </Button>
                <Button
                  color="primary"
                  isLoading={resolverSaving}
                  onPress={() => void ejecutarResolver()}
                >
                  Confirmar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <div className="rounded-lg border border-pastel-border bg-pastel-surface p-4">
        <h1 className="text-2xl font-semibold text-pastel-text">Rechazados pre-entrega</h1>
        <p className="mt-1 text-sm text-pastel-text/80">
          Controles rechazados pendientes de corrección o cancelación.
        </p>
        <Button
          size="sm"
          variant="flat"
          className="mt-3"
          onPress={() => void load()}
          isDisabled={loading}
        >
          Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="flex h-28 items-center justify-center">
          <Spinner color="secondary" />
        </div>
      ) : (
        <Table aria-label="Rechazados pre-entrega">
          <TableHeader>
            <TableColumn className={TABLE_HEADER_CLASS}>Reserva</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Cliente</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Fecha evento</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Motivo rechazo</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Auditor</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Estado</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Acciones</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay rechazados pendientes.">
            {filas.map((fila) => (
              <TableRow key={fila.id}>
                <TableCell>#{fila.reservaId}</TableCell>
                <TableCell>{fila.clienteNombre}</TableCell>
                <TableCell>{formatApiDateForUi(fila.fechaReserva)}</TableCell>
                <TableCell className="max-w-[14rem] whitespace-normal text-sm">
                  {fila.motivoRechazo ?? "—"}
                </TableCell>
                <TableCell>{fila.auditorNombre}</TableCell>
                <TableCell>{getEstadoControlPreEntregaLabel(fila.estado)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      onPress={() => solicitarCancelar(fila)}
                    >
                      Cancelar reserva
                    </Button>
                    <Button
                      size="sm"
                      color="primary"
                      onPress={() => abrirResolver(fila)}
                    >
                      Listo para entregar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
