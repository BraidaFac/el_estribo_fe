"use client";

import type { MedicionesReservaJson, MedidasPantalon, MedidasSaco } from "@/lib/domain/reservas/types";
import {
  guardarMedicionesReserva,
  obtenerMedicionesReserva,
} from "@/lib/services/v2/reservas-v2.service";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import {
  Button,
  Checkbox,
  Input,
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

function vacias(): MedicionesReservaJson {
  return {
    saco: {
      pecho: null,
      hombros: null,
      largoSaco: null,
      largoManga: null,
      cintura: null,
      espalda: null,
    },
    pantalon: {
      cintura: null,
      cadera: null,
      largoPiernaInterno: null,
      largoTotal: null,
      tiro: null,
      musloYPierna: null,
      bota: null,
    },
  };
}

const SACO_CAMPOS: { key: keyof MedidasSaco; label: string }[] = [
  { key: "pecho", label: "Pecho" },
  { key: "hombros", label: "Hombros" },
  { key: "largoSaco", label: "Largo de saco" },
  { key: "largoManga", label: "Largo de manga" },
  { key: "cintura", label: "Cintura" },
  { key: "espalda", label: "Espalda" },
];

const PANT_CAMPOS: { key: keyof MedidasPantalon; label: string }[] = [
  { key: "cintura", label: "Cintura" },
  { key: "cadera", label: "Cadera" },
  { key: "largoPiernaInterno", label: "Largo pierna interno" },
  { key: "largoTotal", label: "Largo total" },
  { key: "tiro", label: "Tiro" },
  { key: "musloYPierna", label: "Muslo y pierna" },
  { key: "bota", label: "Bota" },
];

function numToInput(v: number | null): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function inputToNum(s: string): number | null {
  const t = s.trim();
  if (t === "") return null;
  const n = Number(t.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reservaId: number | null;
  /** Si false, oculta bloque pantalón (reserva sin pantalón). */
  tienePantalon: boolean;
  /** Si true, los campos son solo lectura y el footer muestra solo "Cerrar". */
  readOnly?: boolean;
  onGuardado?: () => void;
};

export function MedicionesReservaModal({
  isOpen,
  onOpenChange,
  reservaId,
  tienePantalon,
  readOnly = false,
  onGuardado,
}: Props) {
  const [mediciones, setMediciones] = useState<MedicionesReservaJson>(() => vacias());
  const [creadoPor, setCreadoPor] = useState<{ id: string; name: string } | null>(null);
  const [sinModista, setSinModista] = useState(false);
  const [observacionSaco, setObservacionSaco] = useState("");
  const [observacionPantalon, setObservacionPantalon] = useState("");
  const [observacionGeneral, setObservacionGeneral] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setMediciones(vacias());
    setCreadoPor(null);
    setSinModista(false);
    setObservacionSaco("");
    setObservacionPantalon("");
    setObservacionGeneral("");
  };

  const cargar = useCallback(async () => {
    if (!reservaId) return;
    try {
      setLoading(true);
      const r = await obtenerMedicionesReserva(reservaId);
      setMediciones(r.mediciones);
      setCreadoPor(r.creadoPor ?? null);
      setSinModista(r.sinModista);
      setObservacionSaco(r.observacionSaco ?? "");
      setObservacionPantalon(r.observacionPantalon ?? "");
      setObservacionGeneral(r.observacionGeneral ?? "");
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
      reset();
    } finally {
      setLoading(false);
    }
  }, [reservaId]);

  useEffect(() => {
    if (isOpen && reservaId) void cargar();
    if (!isOpen) reset();
  }, [isOpen, reservaId, cargar]);

  const setSaco = (key: keyof MedidasSaco, raw: string) => {
    setMediciones((m) => ({ ...m, saco: { ...m.saco, [key]: inputToNum(raw) } }));
  };

  const setPant = (key: keyof MedidasPantalon, raw: string) => {
    setMediciones((m) => ({
      ...m,
      pantalon: { ...m.pantalon, [key]: inputToNum(raw) },
    }));
  };

  const guardar = async () => {
    if (!reservaId) return;
    try {
      setSaving(true);
      await guardarMedicionesReserva(reservaId, {
        saco: sinModista ? undefined : mediciones.saco,
        pantalon: tienePantalon && !sinModista ? mediciones.pantalon : undefined,
        observacionSaco: observacionSaco || undefined,
        observacionPantalon: tienePantalon ? (observacionPantalon || undefined) : undefined,
        observacionGeneral: observacionGeneral || undefined,
        sinModista,
      });
      toast.success("Mediciones guardadas");
      onGuardado?.();
      onOpenChange(false);
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const camposDeshabilitados = readOnly || sinModista;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
      classNames={{ base: "max-h-[90dvh]" }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 border-b border-pastel-border pb-2">
          <span className="text-lg font-semibold text-pastel-text">Mediciones</span>
          {reservaId != null && (
            <span className="text-sm font-normal text-pastel-text/70">
              Reserva #{reservaId} · valores en centímetros (opcionales)
            </span>
          )}
          {readOnly && creadoPor && (
            <span className="text-xs font-normal text-pastel-text/60">
              Cargado por: {creadoPor.name}
            </span>
          )}
        </ModalHeader>
        <ModalBody className="gap-4 py-4">
          {!reservaId ? (
            <p className="text-sm text-pastel-text/70">Seleccioná una reserva con datos válidos.</p>
          ) : loading ? (
            <div className="flex justify-center py-12">
              <Spinner color="secondary" />
            </div>
          ) : (
            <>
              {!readOnly && (
                <div className="flex flex-col gap-2">
                  <Checkbox
                    isSelected={sinModista}
                    onValueChange={setSinModista}
                  >
                    No se necesita modista
                  </Checkbox>
                  {sinModista && (
                    <Textarea
                      label="Observación general"
                      placeholder="Motivo por el cual no se necesita modista..."
                      value={observacionGeneral}
                      onValueChange={setObservacionGeneral}
                      size="sm"
                      minRows={2}
                    />
                  )}
                </div>
              )}
              {readOnly && sinModista && (
                <div className="rounded-lg border border-pastel-border bg-pastel-soft/50 p-3">
                  <p className="text-sm font-medium text-pastel-text">No se necesita modista</p>
                  {observacionGeneral && (
                    <p className="mt-1 text-sm text-pastel-text/70">{observacionGeneral}</p>
                  )}
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <section className="rounded-lg border border-pastel-border bg-pastel-soft/50 p-3">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-pastel-text">
                    Saco
                  </h3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {SACO_CAMPOS.map(({ key, label }) => (
                      <Input
                        key={key}
                        size="sm"
                        label={label}
                        placeholder="cm"
                        type="text"
                        inputMode="decimal"
                        isReadOnly={readOnly}
                        isDisabled={camposDeshabilitados}
                        value={numToInput(mediciones.saco[key])}
                        onValueChange={(v) => setSaco(key, v)}
                        classNames={{ label: "text-xs" }}
                      />
                    ))}
                  </div>
                  <Textarea
                    className="mt-3"
                    label="Observaciones saco"
                    placeholder="Anotaciones sobre el saco..."
                    value={observacionSaco}
                    onValueChange={setObservacionSaco}
                    size="sm"
                    minRows={2}
                    isReadOnly={readOnly}
                    isDisabled={sinModista && !readOnly}
                  />
                </section>

                {tienePantalon ? (
                  <section className="rounded-lg border border-pastel-border bg-pastel-soft/50 p-3">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-pastel-text">
                      Pantalón
                    </h3>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {PANT_CAMPOS.map(({ key, label }) => (
                        <Input
                          key={key}
                          size="sm"
                          label={label}
                          placeholder="cm"
                          type="text"
                          inputMode="decimal"
                          isReadOnly={readOnly}
                          isDisabled={camposDeshabilitados}
                          value={numToInput(mediciones.pantalon[key])}
                          onValueChange={(v) => setPant(key, v)}
                          classNames={{ label: "text-xs" }}
                        />
                      ))}
                    </div>
                    <Textarea
                      className="mt-3"
                      label="Observaciones pantalón"
                      placeholder="Anotaciones sobre el pantalón..."
                      value={observacionPantalon}
                      onValueChange={setObservacionPantalon}
                      size="sm"
                      minRows={2}
                      isReadOnly={readOnly}
                      isDisabled={sinModista && !readOnly}
                    />
                  </section>
                ) : (
                  <section className="flex items-center justify-center rounded-lg border border-dashed border-pastel-border bg-pastel-soft/30 p-6 text-center text-sm text-pastel-text/70">
                    Esta reserva no incluye pantalón.
                  </section>
                )}
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter className="border-t border-pastel-border">
          {readOnly ? (
            <Button variant="light" onPress={() => onOpenChange(false)}>
              Cerrar
            </Button>
          ) : (
            <>
              <Button variant="light" onPress={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={guardar}
                isDisabled={!reservaId || loading}
                isLoading={saving}
              >
                Guardar
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
