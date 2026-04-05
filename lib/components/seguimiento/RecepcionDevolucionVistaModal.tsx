"use client";

import type { ReactNode } from "react";
import type { ReservaExtraItem } from "@/lib/domain/accesorios/types";
import { getAccesorioIcon } from "@/lib/domain/accesorios/iconosAccesorios";
import {
  labelBotonesCierres,
  labelDecisionLavado,
  labelDanoGrave,
  labelEstadoGeneral,
  labelRuedosTelas,
} from "@/lib/domain/reservas/recepcionDevolucionLabels";
import type { RecepcionDevolucionRegistro } from "@/lib/domain/reservas/seguimientoReservas";
import { obtenerExtrasReserva } from "@/lib/services/v2/accesorios-v2.service";
import { formatApiDateForUi, formatApiDateTimeForUi } from "@/lib/utils/formatApiDate";
import { formatMoneyAr } from "@/lib/utils/formatMoney";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@heroui/react";
import { useEffect, useState } from "react";

export type RecepcionDevolucionVistaModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  numeroReservaLabel: string;
  data: RecepcionDevolucionRegistro | null;
  reservaId: number | null;
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
  reservaId,
}: RecepcionDevolucionVistaModalProps) {
  const [extras, setExtras] = useState<ReservaExtraItem[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  useEffect(() => {
    if (!isOpen || !reservaId) {
      setExtras([]);
      return;
    }
    setLoadingExtras(true);
    obtenerExtrasReserva(reservaId)
      .then(setExtras)
      .catch(() => setExtras([]))
      .finally(() => setLoadingExtras(false));
  }, [isOpen, reservaId]);

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
                {data.resueltoPor ? ` · Registrado por: ${data.resueltoPor.name}` : ""}
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

          {/* Accesorios */}
          <div className="space-y-2 border-t border-pastel-border/70 pt-3">
            <p className="text-sm font-semibold text-pastel-text">Accesorios</p>
            {loadingExtras ? (
              <div className="flex h-8 items-center justify-center">
                <Spinner size="sm" color="secondary" />
              </div>
            ) : extras.length === 0 ? (
              <p className="text-sm text-pastel-text/50">Sin accesorios registrados.</p>
            ) : (
              <div className="space-y-2">
                {extras.map((e) => {
                  const Icon = getAccesorioIcon(e.accesorio.icono);
                  return (
                    <div
                      key={e.id}
                      className="flex items-start gap-3 rounded-lg border border-pastel-border bg-pastel-soft/60 px-3 py-2 text-sm"
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-pastel-text/70" aria-hidden />
                      <div className="flex-1 space-y-0.5">
                        <span className="font-medium text-pastel-text">
                          {e.accesorio.nombre}
                        </span>
                        {e.observacion && (
                          <p className="text-pastel-text/60">{e.observacion}</p>
                        )}
                        <p className="text-pastel-text/70">
                          {e.devuelto === null
                            ? "Sin registrar devolución"
                            : e.devuelto
                              ? "Devuelto"
                              : "No devuelto"}
                          {e.observacionDevolucion && ` — ${e.observacionDevolucion}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
