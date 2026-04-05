"use client";

import type {
  CreateControlPreEntregaPayload,
  MotivoRechazoPreEntrega,
} from "@/lib/domain/control-pre-entrega/types";
import {
  MOTIVOS_RECHAZO_LABELS,
  TODOS_LOS_MOTIVOS,
} from "@/lib/domain/control-pre-entrega/types";
import { crearControlPreEntrega } from "@/lib/services/v2/control-pre-entrega-v2.service";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
  Textarea,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ScoreStars } from "@/lib/components/ui/ScoreStars";

export type ControlPreEntregaModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reservaId: number | null;
  numeroReservaLabel: string;
  clienteNombre: string;
  onGuardado?: () => void;
};

const emptyForm = () => ({
  aromaScore: 1,
  planchadoScore: 1,
  sastreriaScore: 1,
  higieneScore: 1,
  complementosScore: 1,
  aromaObs: "",
  planchadoObs: "",
  sastreriaObs: "",
  higieneObs: "",
  complementosObs: "",
  resultado: "APROBADO" as "APROBADO" | "RECHAZADO",
  motivosRechazo: [] as MotivoRechazoPreEntrega[],
});

export function ControlPreEntregaModal({
  isOpen,
  onOpenChange,
  reservaId,
  numeroReservaLabel,
  clienteNombre,
  onGuardado,
}: ControlPreEntregaModalProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => emptyForm());

  const reset = useCallback(() => {
    setForm(emptyForm());
  }, []);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const setScore = (
    key:
      | "aromaScore"
      | "planchadoScore"
      | "sastreriaScore"
      | "higieneScore"
      | "complementosScore",
    v: number,
  ) => {
    setForm((f) => ({ ...f, [key]: v }));
  };

  const handleSubmit = async () => {
    if (reservaId == null) return;
    if (form.resultado === "RECHAZADO" && form.motivosRechazo.length === 0) {
      toast.error("Seleccioná al menos un motivo de rechazo");
      return;
    }
    const payload: CreateControlPreEntregaPayload = {
      reservaId,
      aromaScore: form.aromaScore,
      planchadoScore: form.planchadoScore,
      sastreriaScore: form.sastreriaScore,
      higieneScore: form.higieneScore,
      complementosScore: form.complementosScore,
      aromaObs: form.aromaObs.trim() || undefined,
      planchadoObs: form.planchadoObs.trim() || undefined,
      sastreriaObs: form.sastreriaObs.trim() || undefined,
      higieneObs: form.higieneObs.trim() || undefined,
      complementosObs: form.complementosObs.trim() || undefined,
      estado: form.resultado,
      motivosRechazo:
        form.resultado === "RECHAZADO" ? form.motivosRechazo : undefined,
    };
    try {
      setSaving(true);
      await crearControlPreEntrega(payload);
      toast.success(
        form.resultado === "APROBADO"
          ? "Control aprobado — reserva lista para entregar"
          : "Control registrado como rechazado",
      );
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
      size="3xl"
      scrollBehavior="inside"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b border-pastel-border">
              <span>Control pre-entrega</span>
              <span className="text-sm font-normal text-pastel-text/80">
                Revise cada criterio y el resultado final.
              </span>
            </ModalHeader>
            <ModalBody className="gap-4 py-4">
              <div className="grid grid-cols-1 gap-2 rounded-lg bg-pastel-surface/80 p-3 text-sm md:grid-cols-2">
                <p>
                  <span className="text-pastel-text/70">Nº reserva:</span>{" "}
                  <span className="font-semibold">{numeroReservaLabel}</span>
                </p>
                <p>
                  <span className="text-pastel-text/70">Cliente:</span>{" "}
                  <span className="font-semibold">{clienteNombre}</span>
                </p>
              </div>

              <ScoreStars
                label="Aroma"
                value={form.aromaScore}
                onChange={(v) => setScore("aromaScore", v)}
              />
              <Textarea
                label="Observación aroma (opcional)"
                size="sm"
                minRows={1}
                value={form.aromaObs}
                onValueChange={(v) => setForm((f) => ({ ...f, aromaObs: v }))}
              />

              <ScoreStars
                label="Planchado"
                value={form.planchadoScore}
                onChange={(v) => setScore("planchadoScore", v)}
              />
              <Textarea
                label="Observación planchado (opcional)"
                size="sm"
                minRows={1}
                value={form.planchadoObs}
                onValueChange={(v) => setForm((f) => ({ ...f, planchadoObs: v }))}
              />

              <ScoreStars
                label="Sastrería"
                value={form.sastreriaScore}
                onChange={(v) => setScore("sastreriaScore", v)}
              />
              <Textarea
                label="Observación sastrería (opcional)"
                size="sm"
                minRows={1}
                value={form.sastreriaObs}
                onValueChange={(v) => setForm((f) => ({ ...f, sastreriaObs: v }))}
              />

              <ScoreStars
                label="Higiene"
                value={form.higieneScore}
                onChange={(v) => setScore("higieneScore", v)}
              />
              <Textarea
                label="Observación higiene (opcional)"
                size="sm"
                minRows={1}
                value={form.higieneObs}
                onValueChange={(v) => setForm((f) => ({ ...f, higieneObs: v }))}
              />

              <ScoreStars
                label="Complementos"
                value={form.complementosScore}
                onChange={(v) => setScore("complementosScore", v)}
              />
              <Textarea
                label="Observación complementos (opcional)"
                size="sm"
                minRows={1}
                value={form.complementosObs}
                onValueChange={(v) => setForm((f) => ({ ...f, complementosObs: v }))}
              />

              <RadioGroup
                label="Resultado final"
                value={form.resultado}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    resultado: v as "APROBADO" | "RECHAZADO",
                    motivosRechazo: [],
                  }))
                }
                orientation="horizontal"
              >
                <Radio value="APROBADO">Aprobado</Radio>
                <Radio value="RECHAZADO">Rechazado</Radio>
              </RadioGroup>

              {form.resultado === "RECHAZADO" ? (
                <CheckboxGroup
                  label="Motivos del rechazo (seleccioná al menos uno)"
                  value={form.motivosRechazo}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      motivosRechazo: v as MotivoRechazoPreEntrega[],
                    }))
                  }
                  isRequired
                  orientation="horizontal"
                  classNames={{ label: "text-sm text-pastel-text/80" }}
                >
                  {TODOS_LOS_MOTIVOS.map((m) => (
                    <Checkbox key={m} value={m}>
                      {MOTIVOS_RECHAZO_LABELS[m]}
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              ) : null}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cerrar
              </Button>
              <Button
                color="primary"
                isLoading={saving}
                onPress={() => void handleSubmit()}
              >
                Guardar control
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
