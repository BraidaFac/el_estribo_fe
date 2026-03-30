"use client";

import type { ReactNode } from "react";
import {
  labelBotonesCierres,
  labelDecisionLavado,
  labelDanoGrave,
  labelEstadoGeneral,
  labelRuedosTelas,
} from "@/lib/domain/reservas/recepcionDevolucionLabels";
import type { RecepcionDevolucionRegistro } from "@/lib/domain/reservas/seguimientoReservas";
import { formatApiDateForUi, formatApiDateTimeForUi } from "@/lib/utils/formatApiDate";
import { formatMoneyAr } from "@/lib/utils/formatMoney";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

export type RecepcionDevolucionVistaModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  numeroReservaLabel: string;
  data: RecepcionDevolucionRegistro | null;
};

function fila(label: string, value: ReactNode) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-pastel-border/80 bg-white/60 px-3 py-2 text-sm">
      <span className="text-xs font-medium text-pastel-text/65">{label}</span>
      <span className="text-pastel-text">{value}</span>
    </div>
  );
}

export function RecepcionDevolucionVistaModal({
  isOpen,
  onOpenChange,
  numeroReservaLabel,
  data,
}: RecepcionDevolucionVistaModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent className="border border-pastel-border bg-pastel-surface/95">
        <ModalHeader className="flex flex-col gap-1 border-b border-pastel-border/70">
          <span className="text-xl font-semibold text-pastel-text">Recepción / devolución</span>
          <span className="text-sm font-normal text-pastel-text/80">
            Solo lectura — ficha cargada al registrar la devolución del cliente.
          </span>
        </ModalHeader>
        <ModalBody className="max-h-[min(70dvh,560px)] gap-4 overflow-y-auto py-4">
          <p className="text-sm text-pastel-text/80">
            <strong>Nro. reserva:</strong> {numeroReservaLabel}
          </p>

          {!data ? (
            <p className="rounded-lg border border-dashed border-pastel-border bg-pastel-soft/50 p-4 text-sm text-pastel-text/80">
              Aún no hay ficha de recepción/devolución (el traje no fue devuelto o no se registró la
              ficha).
            </p>
          ) : (
            <>
              <p className="text-xs text-pastel-text/70">
                Fecha devolución: <strong>{formatApiDateForUi(data.fechaDevolucion)}</strong> · Alta:{" "}
                {formatApiDateTimeForUi(data.createdAt)}
              </p>
              <div>
                <p className="mb-2 text-sm font-semibold text-pastel-text">Inspección y cobros</p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {fila("Botones / cierres", labelBotonesCierres(data.botonesCierresEstado))}
                  {fila("Cobro arreglo (botones)", formatMoneyAr(data.botonesCierresCobro))}
                  {fila("Ruedos / telas", labelRuedosTelas(data.ruedosTelasEstado))}
                  {fila("Cobro arreglo (ruedos)", formatMoneyAr(data.ruedosTelasCobro))}
                  {fila("Daño grave", labelDanoGrave(data.danoGraveEstado))}
                  {fila("Monto traje nuevo", formatMoneyAr(data.danoGraveCobro))}
                  {fila(
                    "Demora (días)",
                    data.demoraDias != null ? String(data.demoraDias) : "—",
                  )}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-pastel-text">Destino de lavado</p>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {fila("Estado general", labelEstadoGeneral(data.estadoGeneral))}
                  {fila("Decisión", labelDecisionLavado(data.decisionLavado))}
                  {fila(
                    "Responsable limpieza local",
                    data.responsableLimpiezaLocal?.trim() || "—",
                  )}
                </div>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter className="border-t border-pastel-border/70">
          <Button color="primary" variant="flat" onPress={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
