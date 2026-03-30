"use client";

import {
  defaultRecepcionDevolucionPayload,
  type BotonesCierresInspeccion,
  type DanoGraveInspeccion,
  type DecisionLavadoPostDevolucion,
  type EstadoGeneralDevolucion,
  type RecepcionDevolucionPayload,
  type RuedosTelasInspeccion,
} from "@/lib/domain/reservas/recepcionDevolucion";
import { marcarReservaDevuelta } from "@/lib/services/v2/reservas-v2.service";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import { validateRecepcionDevolucionPayload } from "@/lib/utils/validateRecepcionDevolucion";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
} from "@heroui/react";
import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export type DevolucionRecepcionModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reservaId: number | null;
  numeroReservaLabel: string;
  onGuardado?: () => void;
};

type FormState = {
  botonesCierresEstado: BotonesCierresInspeccion;
  botonesCierresCobroStr: string;
  ruedosTelasEstado: RuedosTelasInspeccion;
  ruedosTelasCobroStr: string;
  danoGraveEstado: DanoGraveInspeccion;
  danoGraveCobroStr: string;
  demoraDiasStr: string;
  estadoGeneral: EstadoGeneralDevolucion;
  decisionLavado: DecisionLavadoPostDevolucion;
  responsableLimpiezaLocal: string;
};

function emptyForm(): FormState {
  const d = defaultRecepcionDevolucionPayload();
  return {
    botonesCierresEstado: d.botonesCierresEstado,
    botonesCierresCobroStr: "",
    ruedosTelasEstado: d.ruedosTelasEstado,
    ruedosTelasCobroStr: "",
    danoGraveEstado: d.danoGraveEstado,
    danoGraveCobroStr: "",
    demoraDiasStr: "",
    estadoGeneral: d.estadoGeneral,
    decisionLavado: d.decisionLavado,
    responsableLimpiezaLocal: "",
  };
}

function parseMoney(s: string): number | undefined {
  const t = s.trim().replace(",", ".");
  if (!t) return undefined;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : undefined;
}

function buildPayload(form: FormState): RecepcionDevolucionPayload {
  const bc = parseMoney(form.botonesCierresCobroStr);
  const rtc = parseMoney(form.ruedosTelasCobroStr);
  const dgc = parseMoney(form.danoGraveCobroStr);
  const demoraRaw = form.demoraDiasStr.trim();
  let demoraDias: number | undefined;
  if (demoraRaw) {
    const d = parseInt(demoraRaw, 10);
    if (Number.isFinite(d)) demoraDias = d;
  }

  const p: RecepcionDevolucionPayload = {
    botonesCierresEstado: form.botonesCierresEstado,
    ruedosTelasEstado: form.ruedosTelasEstado,
    danoGraveEstado: form.danoGraveEstado,
    estadoGeneral: form.estadoGeneral,
    decisionLavado: form.decisionLavado,
  };
  if (bc !== undefined) p.botonesCierresCobro = bc;
  if (rtc !== undefined) p.ruedosTelasCobro = rtc;
  if (dgc !== undefined) p.danoGraveCobro = dgc;
  if (demoraDias !== undefined) p.demoraDias = demoraDias;
  if (p.decisionLavado === "LIMPIEZA_LOCAL") {
    p.responsableLimpiezaLocal = form.responsableLimpiezaLocal.trim() || null;
  }
  return p;
}

export function DevolucionRecepcionModal({
  isOpen,
  onOpenChange,
  reservaId,
  numeroReservaLabel,
  onGuardado,
}: DevolucionRecepcionModalProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(() => emptyForm());

  const reset = useCallback(() => {
    setForm(emptyForm());
  }, []);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const fechaDevolucionLabel = format(new Date(), "dd/MM/yyyy");

  const handleSubmit = async () => {
    if (reservaId == null) return;
    const recepcion = buildPayload(form);
    const err = validateRecepcionDevolucionPayload(recepcion);
    if (err) {
      toast.error(err);
      return;
    }
    setSaving(true);
    try {
      await marcarReservaDevuelta(reservaId, { recepcion });
      toast.success(`Reserva ${numeroReservaLabel} registrada como devuelta`);
      onOpenChange(false);
      await onGuardado?.();
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      backdrop="blur"
      scrollBehavior="inside"
      size="2xl"
      classNames={{ base: "my-4 max-h-[92dvh]" }}
    >
      <ModalContent className="border border-pastel-border bg-pastel-surface/95">
        <ModalHeader className="flex flex-col gap-1 border-b border-pastel-border/70 pb-3">
          <span className="text-xl font-semibold text-pastel-text">
            Recepción / devolución del traje
          </span>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-normal text-pastel-text/85">
            <span>
              <strong>Nro. reserva:</strong> {numeroReservaLabel}
            </span>
            <span>
              <strong>Fecha:</strong> {fechaDevolucionLabel}
            </span>
          </div>
        </ModalHeader>
        <ModalBody className="max-h-[min(70dvh,560px)] gap-4 overflow-y-auto py-4">
          <section className="rounded-xl border border-pastel-border bg-pastel-soft/80 p-3">
            <h3 className="mb-2 text-sm font-semibold text-pastel-text">
              A. Inspección de daños y cobros
            </h3>
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-medium text-pastel-text/80">Botones / cierres</p>
                <RadioGroup
                  orientation="horizontal"
                  value={form.botonesCierresEstado}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      botonesCierresEstado: v as BotonesCierresInspeccion,
                      botonesCierresCobroStr: v === "OK" ? "" : f.botonesCierresCobroStr,
                    }))
                  }
                >
                  <Radio value="OK">OK</Radio>
                  <Radio value="DANO_LEVE">Daño leve</Radio>
                </RadioGroup>
                <Input
                  className="mt-2"
                  label="Monto cobro arreglo ($)"
                  type="text"
                  inputMode="decimal"
                  value={form.botonesCierresCobroStr}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, botonesCierresCobroStr: v }))
                  }
                  isDisabled={form.botonesCierresEstado === "OK"}
                  description={
                    form.botonesCierresEstado === "DANO_LEVE"
                      ? "Obligatorio si hay daño leve"
                      : "Solo si hubo cobro (no aplica con OK)"
                  }
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-pastel-text/80">Ruedos / telas</p>
                <RadioGroup
                  orientation="horizontal"
                  classNames={{ wrapper: "flex-wrap gap-x-4" }}
                  value={form.ruedosTelasEstado}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      ruedosTelasEstado: v as RuedosTelasInspeccion,
                      ruedosTelasCobroStr: v === "OK" ? "" : f.ruedosTelasCobroStr,
                    }))
                  }
                >
                  <Radio value="OK">OK</Radio>
                  <Radio value="ENGANCHE">Enganche</Radio>
                  <Radio value="ROTURA">Rotura</Radio>
                </RadioGroup>
                <Input
                  className="mt-2"
                  label="Monto cobro arreglo ($)"
                  type="text"
                  inputMode="decimal"
                  value={form.ruedosTelasCobroStr}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, ruedosTelasCobroStr: v }))
                  }
                  isDisabled={form.ruedosTelasEstado === "OK"}
                  description={
                    form.ruedosTelasEstado === "OK"
                      ? undefined
                      : "Obligatorio con enganche o rotura"
                  }
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-pastel-text/80">Daño grave</p>
                <RadioGroup
                  orientation="horizontal"
                  classNames={{ wrapper: "flex-wrap gap-x-4" }}
                  value={form.danoGraveEstado}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      danoGraveEstado: v as DanoGraveInspeccion,
                      danoGraveCobroStr: v === "OK" ? "" : f.danoGraveCobroStr,
                    }))
                  }
                >
                  <Radio value="OK">OK</Radio>
                  <Radio value="QUEMADURA">Quemadura</Radio>
                  <Radio value="MANCHA_QUIMICA">Mancha química</Radio>
                </RadioGroup>
                <Input
                  className="mt-2"
                  label="Monto por traje nuevo ($)"
                  type="text"
                  inputMode="decimal"
                  value={form.danoGraveCobroStr}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, danoGraveCobroStr: v }))
                  }
                  isDisabled={form.danoGraveEstado === "OK"}
                  description={
                    form.danoGraveEstado === "OK"
                      ? undefined
                      : "Obligatorio con quemadura o mancha química"
                  }
                />
              </div>
              <Input
                label="Demora (días de retraso)"
                type="text"
                inputMode="numeric"
                value={form.demoraDiasStr}
                onValueChange={(v) => setForm((f) => ({ ...f, demoraDiasStr: v }))}
                description="Opcional. Dejar vacío si no hubo demora."
              />
            </div>
          </section>

          <section className="rounded-xl border border-pastel-border bg-pastel-soft/80 p-3">
            <h3 className="mb-2 text-sm font-semibold text-pastel-text">
              B. Destino de lavado
            </h3>
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-medium text-pastel-text/80">Estado general</p>
                <RadioGroup
                  value={form.estadoGeneral}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      estadoGeneral: v as EstadoGeneralDevolucion,
                    }))
                  }
                >
                  <Radio value="SUCIIO_O_MANCHADO">Sucio o manchado</Radio>
                  <Radio value="IMPECABLE">Impecable (olor neutro)</Radio>
                </RadioGroup>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-pastel-text/80">Decisión</p>
                <RadioGroup
                  value={form.decisionLavado}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      decisionLavado: v as DecisionLavadoPostDevolucion,
                      responsableLimpiezaLocal:
                        v === "LIMPIEZA_LOCAL" ? f.responsableLimpiezaLocal : "",
                    }))
                  }
                >
                  <Radio value="LAVANDERIA_EXTERNA">Lavandería externa</Radio>
                  <Radio value="LIMPIEZA_LOCAL">Limpieza local</Radio>
                </RadioGroup>
              </div>
              <Input
                label="Responsable limpieza local"
                value={form.responsableLimpiezaLocal}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, responsableLimpiezaLocal: v }))
                }
                isDisabled={form.decisionLavado !== "LIMPIEZA_LOCAL"}
                description="Obligatorio si la decisión es limpieza local"
              />
            </div>
          </section>
        </ModalBody>
        <ModalFooter className="border-t border-pastel-border/70">
          <Button variant="flat" onPress={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button color="secondary" isLoading={saving} onPress={() => void handleSubmit()}>
            Confirmar devolución
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
