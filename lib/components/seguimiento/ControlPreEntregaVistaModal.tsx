"use client";

import type { ControlPreEntregaRecord } from "@/lib/domain/control-pre-entrega/types";
import { getEstadoControlPreEntregaLabel } from "@/lib/domain/reservas/labels";
import { formatApiDateTimeForUi } from "@/lib/utils/formatApiDate";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

export type ControlPreEntregaVistaModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  numeroReservaLabel: string;
  clienteNombre: string;
  data: ControlPreEntregaRecord | null;
};

function fila(label: string, value: string | number | null | undefined) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-pastel-border/80 bg-white/60 px-3 py-2 text-sm">
      <span className="text-xs font-medium text-pastel-text/65">{label}</span>
      <span className="text-pastel-text">{value === null || value === undefined || value === "" ? "—" : value}</span>
    </div>
  );
}

export function ControlPreEntregaVistaModal({
  isOpen,
  onOpenChange,
  numeroReservaLabel,
  clienteNombre,
  data,
}: ControlPreEntregaVistaModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent className="border border-pastel-border bg-pastel-surface/95">
        <ModalHeader className="flex flex-col gap-1 border-b border-pastel-border/70">
          <span className="text-xl font-semibold text-pastel-text">Control pre-entrega</span>
          <span className="text-sm font-normal text-pastel-text/80">
            Solo lectura — cómo quedó registrada la pre-entrega / control de calidad.
          </span>
        </ModalHeader>
        <ModalBody className="max-h-[min(70dvh,560px)] gap-4 overflow-y-auto py-4">
          <div className="grid grid-cols-1 gap-2 rounded-lg bg-pastel-soft/80 p-3 text-sm md:grid-cols-2">
            <p>
              <span className="text-pastel-text/70">Nº reserva:</span>{" "}
              <span className="font-semibold">{numeroReservaLabel}</span>
            </p>
            <p>
              <span className="text-pastel-text/70">Cliente:</span>{" "}
              <span className="font-semibold">{clienteNombre}</span>
            </p>
          </div>

          {!data ? (
            <p className="rounded-lg border border-dashed border-pastel-border bg-pastel-soft/50 p-4 text-sm text-pastel-text/80">
              No hay control de pre-entrega registrado para esta reserva.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {fila("Aroma (puntaje)", data.aromaScore)}
                {fila("Obs. aroma", data.aromaObs)}
                {fila("Planchado", data.planchadoScore)}
                {fila("Obs. planchado", data.planchadoObs)}
                {fila("Sastrería", data.sastreriaScore)}
                {fila("Obs. sastrería", data.sastreriaObs)}
                {fila("Higiene", data.higieneScore)}
                {fila("Obs. higiene", data.higieneObs)}
                {fila("Complementos", data.complementosScore)}
                {fila("Obs. complementos", data.complementosObs)}
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {fila("Resultado", getEstadoControlPreEntregaLabel(data.estado))}
                {fila("Motivo rechazo", data.motivoRechazo)}
                {fila("Auditor", data.auditorNombre)}
                {fila("Registrado", formatApiDateTimeForUi(data.createdAt))}
                {fila("Fecha resolución", data.fechaResolucion ?? "—")}
                {fila("Resuelto por", data.resueltoPor)}
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
