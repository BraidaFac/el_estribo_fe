"use client";

import type { PasoCompletado, RevertirUltimoPasoPayload } from "@/lib/domain/reservas/pasosReserva";
import { obtenerPasosCompletados, revertirUltimoPaso } from "@/lib/services/v2/reservas-v2.service";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import { formatApiDateTimeForUi } from "@/lib/utils/formatApiDate";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Textarea,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function labelTipoPaso(tipo: PasoCompletado["tipo"]): string {
  switch (tipo) {
    case "CONTACTO_MEDICION_MARCADO": return "Contacto cliente (medición)";
    case "MEDICION_PROGRAMADA": return "Medición programada";
    case "MEDICIONES_REGISTRADAS": return "Mediciones registradas";
    case "LAVANDERIA_OMITIDA": return "Lavandería omitida";
    case "MODISTA_OMITIDA": return "Modista omitida";
    case "ENVIO_LAVANDERIA": return "Envío a lavandería";
    case "RECEPCION_LAVANDERIA": return "Recepción de lavandería";
    case "ENVIO_MODISTA": return "Envío a modista";
    case "RECEPCION_MODISTA": return "Recepción de modista";
    case "CONTROL_PRE_ENTREGA": return "Control pre-entrega";
    case "RETIRO_CLIENTE": return "Retiro por cliente";
    case "DEVOLUCION_CLIENTE": return "Devolución de cliente";
    default: return tipo;
  }
}

interface Props {
  reservaId: number;
  onReversion?: () => void;
}

export function PasosRealizadosTab({ reservaId, onReversion }: Props) {
  const [loading, setLoading] = useState(true);
  const [pasos, setPasos] = useState<PasoCompletado[]>([]);
  const [selectedPaso, setSelectedPaso] = useState<PasoCompletado | null>(null);
  const [reverting, setReverting] = useState(false);
  const [motivo, setMotivo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await obtenerPasosCompletados(reservaId);
      setPasos(data);
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [reservaId]);

  useEffect(() => {
    void load();
  }, [load]);

  function openConfirm(paso: PasoCompletado) {
    setSelectedPaso(paso);
    setMotivo("");
  }

  function closeConfirm() {
    setSelectedPaso(null);
    setMotivo("");
  }

  async function handleRevertir() {
    if (!selectedPaso) return;
    if (!motivo.trim()) {
      toast.error("Ingresá un motivo para la reversión.");
      return;
    }
    setReverting(true);
    try {
      const payload: RevertirUltimoPasoPayload = {
        tipo: selectedPaso.tipo,
        tareaId: selectedPaso.tareaId,
        agendaId: selectedPaso.agendaId,
        motivo: motivo.trim(),
      };
      const updatedPasos = await revertirUltimoPaso(reservaId, payload);
      setPasos(updatedPasos);
      toast.success("Paso revertido correctamente.");
      closeConfirm();
      onReversion?.();
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
    } finally {
      setReverting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[20dvh] items-center justify-center">
        <Spinner color="secondary" />
      </div>
    );
  }

  if (pasos.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-pastel-text/60">
        No hay pasos completados para esta reserva.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-pastel-text/60">
        Solo el último paso puede revertirse. Para deshacer un paso anterior, revertí los siguientes primero.
      </p>

      <ol className="space-y-2">
        {pasos.map((paso, idx) => {
          const isLast = idx === pasos.length - 1;
          return (
            <li
              key={paso.id}
              className={`flex flex-wrap items-start justify-between gap-3 rounded-xl border p-3 text-sm ${
                isLast
                  ? "border-pastel-border bg-pastel-surface"
                  : "border-transparent bg-pastel-soft/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pastel-border text-xs font-semibold text-pastel-text">
                  {idx + 1}
                </span>
                <div>
                  <p className="font-medium text-pastel-text">{labelTipoPaso(paso.tipo)}</p>
                  <p className="mt-0.5 text-xs text-pastel-text/70">{paso.descripcion}</p>
                  <p className="mt-0.5 text-xs text-pastel-text/50">
                    {formatApiDateTimeForUi(paso.fechaCompletado)}
                  </p>
                </div>
              </div>

              {paso.puedeRevertirse && (
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={() => openConfirm(paso)}
                >
                  Revertir
                </Button>
              )}
            </li>
          );
        })}
      </ol>

      <Modal isOpen={selectedPaso != null} onOpenChange={(open) => { if (!open) closeConfirm(); }} size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Revertir paso</ModalHeader>
              <ModalBody>
                <p className="text-sm text-pastel-text">
                  Vas a revertir:{" "}
                  <span className="font-semibold">
                    {selectedPaso ? labelTipoPaso(selectedPaso.tipo) : ""}
                  </span>
                </p>
                {selectedPaso && (
                  <p className="text-xs text-pastel-text/60">{selectedPaso.descripcion}</p>
                )}
                <Textarea
                  label="Motivo"
                  placeholder="Describí el motivo de la reversión"
                  value={motivo}
                  onValueChange={setMotivo}
                  maxLength={300}
                  minRows={2}
                  className="mt-2"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} isDisabled={reverting}>
                  Cancelar
                </Button>
                <Button
                  color="danger"
                  onPress={handleRevertir}
                  isLoading={reverting}
                  isDisabled={!motivo.trim()}
                >
                  Confirmar reversión
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
