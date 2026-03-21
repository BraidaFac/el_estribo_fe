"use client";

import type { Modista } from "@/lib/domain/reservas/types";
import { listarModistas } from "@/lib/services/v2";
import {
  registrarEnvioModistaPorReserva,
  type EnviarModistaReservaPayload,
} from "@/lib/services/v2/tareas-operativas-v2.service";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import {
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export type EnvioModistaReservaModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reservaId: number | null;
  tienePantalon: boolean;
  onGuardado?: () => void;
};

export function EnvioModistaReservaModal({
  isOpen,
  onOpenChange,
  reservaId,
  tienePantalon,
  onGuardado,
}: EnvioModistaReservaModalProps) {
  const [modistas, setModistas] = useState<Modista[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sacoVa, setSacoVa] = useState(true);
  const [pantVa, setPantVa] = useState(true);
  const [mismaModista, setMismaModista] = useState(true);
  const [sacoModId, setSacoModId] = useState<string>("");
  const [pantModId, setPantModId] = useState<string>("");

  const predeterminadaId = useMemo(
    () => modistas.find((m) => m.predeterminada)?.id,
    [modistas],
  );

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setLoadingList(true);
        const data = await listarModistas();
        setModistas(data.filter((m) => m.activo));
        const def = data.find((m) => m.predeterminada && m.activo)?.id;
        const first = def ?? data.find((m) => m.activo)?.id;
        const key = first != null ? String(first) : "";
        setSacoModId(key);
        setPantModId(key);
      } catch (e) {
        toast.error(getUserFacingErrorMessage(e));
      } finally {
        setLoadingList(false);
      }
    })();
  }, [isOpen]);

  useEffect(() => {
    if (mismaModista && sacoModId) {
      setPantModId(sacoModId);
    }
  }, [mismaModista, sacoModId]);

  const resetForm = () => {
    setSacoVa(true);
    setPantVa(true);
    setMismaModista(true);
    const key =
      predeterminadaId != null ? String(predeterminadaId) : sacoModId;
    setSacoModId(key);
    setPantModId(key);
  };

  const handleGuardar = async () => {
    if (!reservaId) return;
    if (sacoVa && !sacoModId) {
      toast.error("Elegí modista para el saco");
      return;
    }
    if (tienePantalon && pantVa && !pantModId) {
      toast.error("Elegí modista para el pantalón");
      return;
    }
    const payload: EnviarModistaReservaPayload = {
      sacoVaAModista: sacoVa,
      sacoModistaId: sacoVa ? Number(sacoModId) : undefined,
      pantalonVaAModista: tienePantalon ? pantVa : undefined,
      pantalonModistaId: tienePantalon && pantVa ? Number(pantModId) : undefined,
    };
    try {
      setSaving(true);
      await registrarEnvioModistaPorReserva(reservaId, payload);
      toast.success("Envío a modista registrado");
      onOpenChange(false);
      resetForm();
      onGuardado?.();
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen && reservaId != null}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
      placement="center"
      backdrop="blur"
      className="border border-pastel-border bg-pastel-surface"
    >
      <ModalContent>
        <ModalHeader className="text-pastel-text">
          Enviar a modista — reserva #{reservaId}
        </ModalHeader>
        <ModalBody className="gap-3 text-pastel-text">
          {loadingList ? (
            <div className="flex justify-center py-6">
              <Spinner color="secondary" />
            </div>
          ) : (
            <>
              <Checkbox isSelected={sacoVa} onValueChange={setSacoVa}>
                El saco va a modista
              </Checkbox>
              {sacoVa ? (
                <Select
                  label="Modista (saco)"
                  selectedKeys={sacoModId ? new Set([sacoModId]) : new Set()}
                  onSelectionChange={(keys) => {
                    const k = Array.from(keys)[0];
                    setSacoModId(k != null ? String(k) : "");
                  }}
                >
                  {modistas.map((m) => (
                    <SelectItem key={String(m.id)}>{m.nombre}</SelectItem>
                  ))}
                </Select>
              ) : null}

              {tienePantalon ? (
                <>
                  <Checkbox isSelected={pantVa} onValueChange={setPantVa}>
                    El pantalón va a modista
                  </Checkbox>
                  <Checkbox isSelected={mismaModista} onValueChange={setMismaModista}>
                    Misma modista para pantalón y saco
                  </Checkbox>
                  {pantVa && !mismaModista ? (
                    <Select
                      label="Modista (pantalón)"
                      selectedKeys={pantModId ? new Set([pantModId]) : new Set()}
                      onSelectionChange={(keys) => {
                        const k = Array.from(keys)[0];
                        setPantModId(k != null ? String(k) : "");
                      }}
                    >
                      {modistas.map((m) => (
                        <SelectItem key={String(m.id)}>{m.nombre}</SelectItem>
                      ))}
                    </Select>
                  ) : null}
                </>
              ) : null}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            color="primary"
            isDisabled={loadingList}
            isLoading={saving}
            onPress={() => void handleGuardar()}
          >
            Confirmar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
