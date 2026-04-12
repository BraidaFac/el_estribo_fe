"use client";

import ConfirmModal, {
  type ConfirmModalRef,
} from "@/lib/components/ConfirmModal";
import { ControlPreEntregaModal } from "@/lib/components/planillas/ControlPreEntregaModal";
import type { PlanillaPrepararFila } from "@/lib/domain/control-pre-entrega/types";
import { fetchPlanillaPrepararEntrega } from "@/lib/services/v2/control-pre-entrega-v2.service";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import { formatApiDateForUi } from "@/lib/utils/formatApiDate";
import { TABLE_HEADER_CLASS } from "@/lib/utils/uiStyles";
import {
  Button,
  Chip,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

function rowPriorityClass(fila: PlanillaPrepararFila): string {
  const { diasHastaReserva, tieneTareasPendientes } = fila;
  if (tieneTareasPendientes && diasHastaReserva <= 1) {
    return "bg-red-50/90 border-l-4 border-l-red-400";
  }
  if (tieneTareasPendientes && diasHastaReserva >= 2 && diasHastaReserva <= 4) {
    return "bg-amber-50/90 border-l-4 border-l-amber-400";
  }
  return "";
}

export function PlanillaPrepararEntregaPage() {
  const [loading, setLoading] = useState(true);
  const [filas, setFilas] = useState<PlanillaPrepararFila[]>([]);
  const [modalReservaId, setModalReservaId] = useState<number | null>(null);
  const [modalCliente, setModalCliente] = useState("");
  const confirmRef = useRef<ConfirmModalRef>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPlanillaPrepararEntrega();
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

  const modalNumero = useMemo(() => {
    if (modalReservaId == null) return "";
    return `#${modalReservaId}`;
  }, [modalReservaId]);

  const abrirControl = (fila: PlanillaPrepararFila) => {
    if (!fila.puedeIniciarPreEntrega) return;
    const run = () => {
      setModalReservaId(fila.reservaId);
      setModalCliente(fila.clienteNombre);
    };
    if (fila.diasHastaReserva > 1) {
      void confirmRef.current
        ?.openModal({
          title: "Preparar con anticipación",
          message:
            "Esta reserva todavía no está próxima a la fecha de entrega y faltan varios días. ¿Desea continuar igualmente?",
          confirmText: "Continuar",
          cancelText: "Cancelar",
          variant: "warning",
        })
        .then((ok) => {
          if (ok) run();
        });
      return;
    }
    run();
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <ConfirmModal ref={confirmRef} />

      <ControlPreEntregaModal
        isOpen={modalReservaId != null}
        onOpenChange={(open) => {
          if (!open) setModalReservaId(null);
        }}
        reservaId={modalReservaId}
        numeroReservaLabel={modalNumero}
        clienteNombre={modalCliente}
        onGuardado={() => void load()}
      />

      <div className="rounded-lg border border-pastel-border bg-pastel-surface p-4">
        <h1 className="text-2xl font-semibold text-pastel-text">
          Preparar para entrega
        </h1>
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
        <Table aria-label="Preparar para entrega">
          <TableHeader>
            <TableColumn className={TABLE_HEADER_CLASS}>Reserva</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>
              Fecha evento
            </TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Cliente</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Saco</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Pantalón</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>
              Días hasta evento
            </TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Tareas</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Acción</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay reservas en ventana para preparar.">
            {filas.map((fila) => (
              <TableRow key={fila.reservaId} className={rowPriorityClass(fila)}>
                <TableCell>#{fila.reservaId}</TableCell>
                <TableCell>{formatApiDateForUi(fila.fechaReserva)}</TableCell>
                <TableCell>{fila.clienteNombre}</TableCell>
                <TableCell>{fila.sacocodigo}</TableCell>
                <TableCell>{fila.pantalonCodigo ?? "Sin Pantalon"}</TableCell>
                <TableCell>{fila.diasHastaReserva}</TableCell>
                <TableCell>
                  {fila.tieneTareasPendientes ? (
                    <Chip size="sm" color="warning" variant="flat">
                      Pendientes
                    </Chip>
                  ) : (
                    <Chip size="sm" color="success" variant="flat">
                      Sin pendientes
                    </Chip>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    color="primary"
                    isDisabled={!fila.puedeIniciarPreEntrega}
                    title={
                      !fila.puedeIniciarPreEntrega
                        ? "Cierre primero las tareas operativas pendientes"
                        : undefined
                    }
                    onPress={() => abrirControl(fila)}
                  >
                    Preparar para entrega
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
