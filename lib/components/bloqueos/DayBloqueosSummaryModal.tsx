"use client";

import { getTipoBloqueoLabel } from "@/lib/domain/reservas/labels";
import { BloqueoPrenda, Reserva, TipoBloqueo } from "@/lib/domain/reservas/types";
import {
  formatApiDateForUi
} from "@/lib/utils/formatApiDate";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { CancelBlockAction } from "./CancelBlockAction";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  dayKey: string;
  bloqueosActivos: BloqueoPrenda[];
  onOpenReservationActions: (reserva: Reserva) => void;
  onOpenMediciones: (reservaId: number, tienePantalon: boolean) => void;
  onBloqueosCancelled: () => void;
};

const BLOQUEO_CARD_CLASS: Record<TipoBloqueo, string> = {
  RESERVA: "border-rose-200 bg-rose-50 text-rose-900",
  LISTO_TIENDA: "border-indigo-200 bg-indigo-50 text-indigo-900",
  MEDICION: "border-orange-200 bg-orange-50 text-orange-900",
  MODISTA: "border-violet-200 bg-violet-50 text-violet-900",
  LAVANDERIA: "border-sky-200 bg-sky-50 text-sky-900",
  MANUAL: "border-amber-200 bg-amber-50 text-amber-900",
  MANTENIMIENTO: "border-amber-200 bg-amber-50 text-amber-900",
};

export function DayBloqueosSummaryModal({
  isOpen,
  onClose,
  dayKey,
  bloqueosActivos,
  onOpenReservationActions,
  onOpenMediciones,
  onBloqueosCancelled,
}: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      placement="center"
      backdrop="blur"
      className="max-h-[90dvh] overflow-auto"
    >
      <ModalContent>
        <>
          <ModalHeader>
            Bloqueos del día {dayKey ? formatApiDateForUi(dayKey) : ""}
          </ModalHeader>
          <ModalBody className="pb-6">
            {bloqueosActivos.length === 0 ? (
              <p className="text-sm text-pastel-text/80">
                No hay bloqueos activos para este día.
              </p>
            ) : (
              <div className="space-y-3">
                {bloqueosActivos.map((bloqueo) => (
                  <BloqueoCard
                    key={bloqueo.id}
                    bloqueo={bloqueo}
                    onOpenReservationActions={onOpenReservationActions}
                    onOpenMediciones={onOpenMediciones}
                    onBloqueosCancelled={onBloqueosCancelled}
                    onCloseParent={onClose}
                  />
                ))}
              </div>
            )}
          </ModalBody>
        </>
      </ModalContent>
    </Modal>
  );
}

type BloqueoCardProps = {
  bloqueo: BloqueoPrenda;
  onOpenReservationActions: (reserva: Reserva) => void;
  onOpenMediciones: (reservaId: number, tienePantalon: boolean) => void;
  onBloqueosCancelled: () => void;
  onCloseParent: () => void;
};

function BloqueoCard({
  bloqueo,
  onOpenReservationActions,
  onOpenMediciones,
  onBloqueosCancelled,
  onCloseParent,
}: BloqueoCardProps) {
  return (
    <div className={`rounded border p-3 ${BLOQUEO_CARD_CLASS[bloqueo.tipoBloqueo]}`}>
      <p className="mb-2 text-sm font-semibold">
        {getTipoBloqueoLabel(bloqueo.tipoBloqueo)}
      </p>
      <div className="mb-3 space-y-0.5 text-sm">
        {bloqueo.tipoBloqueo === "RESERVA" && bloqueo.reserva && (
          <>
            <p>
              <span className="font-medium">Cliente:</span>{" "}
              {bloqueo.reserva.clienteNombre}
            </p>
            <p>
              <span className="font-medium">Fecha reserva:</span>{" "}
              {formatApiDateForUi(bloqueo.reserva.fechaReserva)}
            </p>
          </>
        )}
        {bloqueo.tipoBloqueo === "MODISTA" && bloqueo.modista && (
          <p>
            <span className="font-medium">Modista:</span> {bloqueo.modista.nombre}
          </p>
          
        )}
        {bloqueo.tipoBloqueo === "LAVANDERIA" && bloqueo.lavanderia && (
          <p>
            <span className="font-medium">Lavandería:</span>{" "}
            {bloqueo.lavanderia.nombre}
          </p>
        )}
        {(bloqueo.tipoBloqueo === "LISTO_TIENDA" ||
          bloqueo.tipoBloqueo === "MANUAL" ||
          bloqueo.tipoBloqueo === "MANTENIMIENTO") &&
          bloqueo.motivo && (
            <p>
              <span className="font-medium">Motivo:</span> {bloqueo.motivo}
            </p>
          )}
      </div>

      <div className="flex flex-wrap gap-2">
        {bloqueo.tipoBloqueo === "RESERVA" && bloqueo.reserva && (
          <button
            type="button"
            className="rounded bg-white/80 px-3 py-1 text-sm font-medium hover:bg-white"
            onClick={() => {
              onCloseParent();
              onOpenReservationActions(bloqueo.reserva!);
            }}
          >
            Ver reserva
          </button>
        )}
        {bloqueo.tipoBloqueo === "MEDICION" && bloqueo.reserva?.id != null && (
          <button
            type="button"
            className="rounded bg-white/80 px-3 py-1 text-sm font-medium hover:bg-white"
            onClick={() => {
              onCloseParent();
              onOpenMediciones(
                bloqueo.reserva!.id,
                bloqueo.reserva!.pantalon != null,
              );
            }}
          >
            Ver mediciones
          </button>
        )}
        {bloqueo.cancelableManual && bloqueo.estado === "ACTIVO" && (
           <CancelBlockAction
           bloqueoId={bloqueo.id}
           isDisabled={!bloqueo.cancelableManual}
           onCancelled={onBloqueosCancelled}
         />
        )}
       
      </div>
    </div>
  );
}
