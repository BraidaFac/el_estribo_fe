"use client";

import type { ControlPreEntregaRecord } from "@/lib/domain/control-pre-entrega/types";
import { MOTIVOS_RECHAZO_LABELS } from "@/lib/domain/control-pre-entrega/types";
import type { AccesorioItem, ReservaExtraItem } from "@/lib/domain/accesorios/types";
import { getAccesorioIcon } from "@/lib/domain/accesorios/iconosAccesorios";
import type { EstadoReserva } from "@/lib/domain/reservas/types";
import { getEstadoControlPreEntregaLabel } from "@/lib/domain/reservas/labels";
import {
  listarAccesorios,
  obtenerExtrasReserva,
  setExtrasReserva,
} from "@/lib/services/v2/accesorios-v2.service";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import { formatApiDateTimeForUi } from "@/lib/utils/formatApiDate";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "@heroui/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type ControlPreEntregaVistaModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  numeroReservaLabel: string;
  clienteNombre: string;
  data: ControlPreEntregaRecord | null;
  reservaId: number | null;
  estadoReserva: EstadoReserva | null;
};

function fila(label: string, value: string | number | null | undefined) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-pastel-border/80 bg-white/60 px-3 py-2 text-sm">
      <span className="text-xs font-medium text-pastel-text/65">{label}</span>
      <span className="text-pastel-text">{value === null || value === undefined || value === "" ? "—" : value}</span>
    </div>
  );
}

type ExtraEditState = {
  accesorioId: number;
  observacion: string;
};

export function ControlPreEntregaVistaModal({
  isOpen,
  onOpenChange,
  numeroReservaLabel,
  clienteNombre,
  data,
  reservaId,
  estadoReserva,
}: ControlPreEntregaVistaModalProps) {
  const [extras, setExtras] = useState<ReservaExtraItem[]>([]);
  const [accesorios, setAccesorios] = useState<AccesorioItem[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [editingExtras, setEditingExtras] = useState(false);
  const [editState, setEditState] = useState<Map<number, ExtraEditState>>(new Map());
  const [savingExtras, setSavingExtras] = useState(false);

  const canEditExtras = estadoReserva !== "COMPLETADA";

  useEffect(() => {
    if (!isOpen || !reservaId) {
      setExtras([]);
      setEditingExtras(false);
      return;
    }
    setLoadingExtras(true);
    Promise.all([obtenerExtrasReserva(reservaId), listarAccesorios()])
      .then(([extrasData, accData]) => {
        setExtras(extrasData);
        setAccesorios(accData);
      })
      .catch(() => {/* extras section fails silently */})
      .finally(() => setLoadingExtras(false));
  }, [isOpen, reservaId]);

  const startEditing = () => {
    const map = new Map<number, ExtraEditState>();
    for (const e of extras) {
      map.set(e.id, { accesorioId: e.accesorio.id, observacion: e.observacion ?? "" });
    }
    setEditState(map);
    setEditingExtras(true);
  };

  const toggleAccesorioEdit = (accesorio: AccesorioItem) => {
    setEditState((prev) => {
      const next = new Map(prev);
      const existing = Array.from(next.values()).find((v) => v.accesorioId === accesorio.id);
      if (existing) {
        // remove by key
        const keyToDelete = Array.from(next.entries()).find(([, v]) => v.accesorioId === accesorio.id)?.[0];
        if (keyToDelete !== undefined) next.delete(keyToDelete);
      } else {
        next.set(Date.now() + accesorio.id, { accesorioId: accesorio.id, observacion: "" });
      }
      return next;
    });
  };

  const setObservacionEdit = (key: number, observacion: string) => {
    setEditState((prev) => {
      const next = new Map(prev);
      const entry = next.get(key);
      if (entry) next.set(key, { ...entry, observacion });
      return next;
    });
  };

  const saveExtras = async () => {
    if (!reservaId) return;
    try {
      setSavingExtras(true);
      const extrasPayload = Array.from(editState.values()).map((e) => ({
        accesorioId: e.accesorioId,
        observacion: e.observacion.trim() || null,
      }));
      const updated = await setExtrasReserva(reservaId, { extras: extrasPayload });
      setExtras(updated);
      setEditingExtras(false);
      toast.success("Accesorios actualizados");
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
    } finally {
      setSavingExtras(false);
    }
  };

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
                {fila(
                  "Motivos rechazo",
                  data.motivosRechazo?.length
                    ? data.motivosRechazo
                        .map((m) => MOTIVOS_RECHAZO_LABELS[m])
                        .join(", ")
                    : null,
                )}
                {fila("Auditor", data.creadoPor?.name ?? null)}
                {fila("Registrado", formatApiDateTimeForUi(data.createdAt))}
                {fila("Fecha resolución", data.fechaResolucion ?? null)}
                {fila("Resuelto por", data.resueltoPor?.name ?? null)}
              </div>
            </>
          )}

          {/* Sección accesorios */}
          <div className="space-y-2 border-t border-pastel-border/70 pt-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-pastel-text">
                Accesorios entregados
              </p>
              {canEditExtras && !editingExtras && (
                <Button size="sm" variant="flat" onPress={startEditing}>
                  Editar
                </Button>
              )}
            </div>

            {loadingExtras ? (
              <div className="flex h-10 items-center justify-center">
                <Spinner size="sm" color="secondary" />
              </div>
            ) : editingExtras ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {accesorios.map((a) => {
                    const isSelected = Array.from(editState.values()).some(
                      (v) => v.accesorioId === a.id,
                    );
                    const Icon = getAccesorioIcon(a.icono);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggleAccesorioEdit(a)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-center transition-colors ${
                          isSelected
                            ? "border-pastel-secondary bg-pastel-secondary/20 text-pastel-text ring-1 ring-pastel-secondary"
                            : "border-pastel-border bg-pastel-surface text-pastel-text hover:border-pastel-secondary/50"
                        }`}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                        <span className="text-xs font-medium">{a.nombre}</span>
                      </button>
                    );
                  })}
                </div>
                {Array.from(editState.entries()).map(([key, entry]) => {
                  const acc = accesorios.find((a) => a.id === entry.accesorioId);
                  if (!acc) return null;
                  return (
                    <Input
                      key={key}
                      label={acc.nombre}
                      size="sm"
                      value={entry.observacion}
                      onValueChange={(v) => setObservacionEdit(key, v)}
                      placeholder="Observación opcional..."
                    />
                  );
                })}
                <div className="flex gap-2">
                  <Button size="sm" variant="flat" onPress={() => setEditingExtras(false)}>
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    isLoading={savingExtras}
                    onPress={() => void saveExtras()}
                  >
                    Guardar accesorios
                  </Button>
                </div>
              </div>
            ) : extras.length === 0 ? (
              <p className="text-sm text-pastel-text/50">Sin accesorios registrados.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {extras.map((e) => {
                  const Icon = getAccesorioIcon(e.accesorio.icono);
                  return (
                    <div
                      key={e.id}
                      className="flex items-center gap-1.5 rounded-lg border border-pastel-border bg-pastel-soft/60 px-3 py-1.5 text-sm"
                    >
                      <Icon className="h-4 w-4 text-pastel-text/70" aria-hidden />
                      <span className="font-medium">{e.accesorio.nombre}</span>
                      {e.observacion && (
                        <span className="text-pastel-text/60">— {e.observacion}</span>
                      )}
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
