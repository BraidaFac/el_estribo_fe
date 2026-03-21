"use client";

import { BloqueoPrenda } from "@/lib/domain/reservas/types";
import {
  getEstadoBloqueoLabel,
  getOrigenBloqueoLabel,
  getTipoBloqueoLabel,
} from "@/lib/domain/reservas/labels";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { formatApiDateForUi, formatApiDateTimeForUi } from "@/lib/utils/formatApiDate";
import { CancelBlockAction } from "./CancelBlockAction";

type BlockDetailPopoverProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dayKey: string | null;
  bloqueos: BloqueoPrenda[];
  onAfterCancel?: () => void;
};

export function BlockDetailPopover({
  isOpen,
  onOpenChange,
  dayKey,
  bloqueos,
  onAfterCancel,
}: BlockDetailPopoverProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      backdrop="blur"
      className="max-h-[90dvh] overflow-auto"
    >
      <ModalContent>
        <>
          <ModalHeader>
            Bloqueos del día {dayKey ? formatApiDateForUi(dayKey) : ""}
          </ModalHeader>
          <ModalBody>
            {bloqueos.length === 0 ? (
              <p className="text-sm text-pastel-text/80">No hay bloqueos para este dia.</p>
            ) : (
              <div className="space-y-3">
                {bloqueos.map((bloqueo) => (
                  <div
                    key={bloqueo.id}
                    className="rounded border border-pastel-border bg-pastel-soft p-3"
                  >
                    <div className="grid grid-cols-1 gap-1 text-sm text-pastel-text md:grid-cols-2">
                      <p>
                        <span className="font-semibold">ID:</span> {bloqueo.id}
                      </p>
                      <p>
                        <span className="font-semibold">Tipo:</span>{" "}
                        {getTipoBloqueoLabel(bloqueo.tipoBloqueo)}
                      </p>
                      <p>
                        <span className="font-semibold">Origen:</span>{" "}
                        {getOrigenBloqueoLabel(bloqueo.origen)}
                      </p>
                      <p>
                        <span className="font-semibold">Estado:</span>{" "}
                        {getEstadoBloqueoLabel(bloqueo.estado)}
                      </p>
                      <p>
                        <span className="font-semibold">Desde:</span>{" "}
                        {formatApiDateTimeForUi(bloqueo.inicio)}
                      </p>
                      <p>
                        <span className="font-semibold">Hasta:</span>{" "}
                        {formatApiDateTimeForUi(bloqueo.fin)}
                      </p>
                      <p>
                        <span className="font-semibold">Cancelable:</span>{" "}
                        {bloqueo.cancelableManual ? "Si" : "No"}
                      </p>
                      <p>
                        <span className="font-semibold">Reserva:</span>{" "}
                        {bloqueo.reserva?.id ?? "-"}
                      </p>
                    </div>
                    <div className="mt-2">
                      <CancelBlockAction
                        bloqueoId={bloqueo.id}
                        isDisabled={
                          !bloqueo.cancelableManual || bloqueo.estado === "CANCELADO"
                        }
                        onCancelled={onAfterCancel}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ModalBody>
        </>
      </ModalContent>
    </Modal>
  );
}
