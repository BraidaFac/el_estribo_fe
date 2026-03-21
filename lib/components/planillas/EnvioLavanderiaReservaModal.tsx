"use client";

import type { Lavanderia } from "@/lib/domain/reservas/types";
import { listarLavanderias } from "@/lib/services/v2";
import {
  registrarEnvioLavanderiaPorReserva,
  type EnviarLavanderiaReservaPayload,
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

export type EnvioLavanderiaReservaModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reservaId: number | null;
  /** Si la reserva incluye pantalón (hay tarea o dato de negocio). */
  tienePantalon: boolean;
  onGuardado?: () => void;
};

export function EnvioLavanderiaReservaModal({
  isOpen,
  onOpenChange,
  reservaId,
  tienePantalon,
  onGuardado,
}: EnvioLavanderiaReservaModalProps) {
  const [lavanderias, setLavanderias] = useState<Lavanderia[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sacoVa, setSacoVa] = useState(true);
  const [pantVa, setPantVa] = useState(true);
  const [mismaLavanderia, setMismaLavanderia] = useState(true);
  const [sacoLavId, setSacoLavId] = useState<string>("");
  const [pantLavId, setPantLavId] = useState<string>("");

  const predeterminadaId = useMemo(
    () => lavanderias.find((l) => l.predeterminada)?.id,
    [lavanderias],
  );

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setLoadingList(true);
        const data = await listarLavanderias();
        setLavanderias(data.filter((l) => l.activo));
        const def = data.find((l) => l.predeterminada && l.activo)?.id;
        const first = def ?? data.find((l) => l.activo)?.id;
        const key = first != null ? String(first) : "";
        setSacoLavId(key);
        setPantLavId(key);
      } catch (e) {
        toast.error(getUserFacingErrorMessage(e));
      } finally {
        setLoadingList(false);
      }
    })();
  }, [isOpen]);

  useEffect(() => {
    if (mismaLavanderia && sacoLavId) {
      setPantLavId(sacoLavId);
    }
  }, [mismaLavanderia, sacoLavId]);

  const resetForm = () => {
    setSacoVa(true);
    setPantVa(true);
    setMismaLavanderia(true);
    const key = predeterminadaId != null ? String(predeterminadaId) : sacoLavId;
    setSacoLavId(key);
    setPantLavId(key);
  };

  const handleGuardar = async () => {
    if (!reservaId) return;
    if (sacoVa && !sacoLavId) {
      toast.error("Elegí lavandería para el saco");
      return;
    }
    if (tienePantalon && pantVa && !pantLavId) {
      toast.error("Elegí lavandería para el pantalón");
      return;
    }
    const payload: EnviarLavanderiaReservaPayload = {
      sacoVaALavanderia: sacoVa,
      sacoLavanderiaId: sacoVa ? Number(sacoLavId) : undefined,
      pantalonVaALavanderia: tienePantalon ? pantVa : undefined,
      pantalonLavanderiaId:
        tienePantalon && pantVa ? Number(pantLavId) : undefined,
    };
    try {
      setSaving(true);
      await registrarEnvioLavanderiaPorReserva(reservaId, payload);
      toast.success("Envío a lavandería registrado");
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
          Enviar a lavandería — reserva #{reservaId}
        </ModalHeader>
        <ModalBody className="gap-3 text-pastel-text">
          {loadingList ? (
            <div className="flex justify-center py-6">
              <Spinner color="secondary" />
            </div>
          ) : (
            <>
              <Checkbox isSelected={sacoVa} onValueChange={setSacoVa}>
                El saco va a lavandería
              </Checkbox>
              {sacoVa ? (
                <Select
                  label="Lavandería (saco)"
                  selectedKeys={sacoLavId ? new Set([sacoLavId]) : new Set()}
                  onSelectionChange={(keys) => {
                    const k = Array.from(keys)[0];
                    setSacoLavId(k != null ? String(k) : "");
                  }}
                >
                  {lavanderias.map((lav) => (
                    <SelectItem key={String(lav.id)}>{lav.nombre}</SelectItem>
                  ))}
                </Select>
              ) : null}

              {tienePantalon ? (
                <>
                  <Checkbox isSelected={pantVa} onValueChange={setPantVa}>
                    El pantalón va a lavandería
                  </Checkbox>
                  <Checkbox isSelected={mismaLavanderia} onValueChange={setMismaLavanderia}>
                    Misma lavandería para pantalón y saco
                  </Checkbox>
                  {pantVa && !mismaLavanderia ? (
                    <Select
                      label="Lavandería (pantalón)"
                      selectedKeys={pantLavId ? new Set([pantLavId]) : new Set()}
                      onSelectionChange={(keys) => {
                        const k = Array.from(keys)[0];
                        setPantLavId(k != null ? String(k) : "");
                      }}
                    >
                      {lavanderias.map((lav) => (
                        <SelectItem key={String(lav.id)}>{lav.nombre}</SelectItem>
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
