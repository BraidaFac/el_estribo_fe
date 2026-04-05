"use client";

import type { AccesorioItem } from "@/lib/domain/accesorios/types";
import { getAccesorioIcon } from "@/lib/domain/accesorios/iconosAccesorios";
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
import { useState } from "react";

type SelectedExtra = {
  accesorioId: number;
  observacion: string;
};

type Props = {
  isOpen: boolean;
  accesorios: AccesorioItem[];
  loadingAccesorios: boolean;
  onConfirm: (extras: { accesorioId: number; observacion: string | null }[]) => void;
  onCancel: () => void;
  confirming?: boolean;
};

export function AccesoriosRetiroModal({
  isOpen,
  accesorios,
  loadingAccesorios,
  onConfirm,
  onCancel,
  confirming = false,
}: Props) {
  const [selected, setSelected] = useState<Map<number, SelectedExtra>>(
    new Map(),
  );

  const toggleAccesorio = (accesorio: AccesorioItem) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(accesorio.id)) {
        next.delete(accesorio.id);
      } else {
        next.set(accesorio.id, {
          accesorioId: accesorio.id,
          observacion: "",
        });
      }
      return next;
    });
  };

  const setObservacion = (accesorioId: number, observacion: string) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const entry = next.get(accesorioId);
      if (entry) next.set(accesorioId, { ...entry, observacion });
      return next;
    });
  };

  const handleConfirm = () => {
    const extras = Array.from(selected.values()).map((e) => ({
      accesorioId: e.accesorioId,
      observacion: e.observacion.trim() || null,
    }));
    onConfirm(extras);
    setSelected(new Map());
  };

  const handleCancel = () => {
    setSelected(new Map());
    onCancel();
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
      backdrop="blur"
      scrollBehavior="inside"
      size="lg"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader>Accesorios entregados</ModalHeader>
            <ModalBody className="gap-4">
              <p className="text-sm text-pastel-text/70">
                Seleccioná los accesorios que se entregan con el traje. Podés
                dejar observaciones opcionales por ítem.
              </p>

              {loadingAccesorios ? (
                <div className="flex h-20 items-center justify-center">
                  <Spinner color="secondary" />
                </div>
              ) : accesorios.length === 0 ? (
                <p className="text-center text-sm text-pastel-text/50">
                  No hay accesorios configurados.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {accesorios.map((a) => {
                    const isSelected = selected.has(a.id);
                    const Icon = getAccesorioIcon(a.icono);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggleAccesorio(a)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-center transition-colors ${
                          isSelected
                            ? "border-pastel-primary bg-pastel-primary/10 text-pastel-primary"
                            : "border-pastel-border bg-pastel-surface text-pastel-text hover:border-pastel-primary/50"
                        }`}
                      >
                        <Icon className="h-6 w-6" aria-hidden />
                        <span className="text-xs font-medium">{a.nombre}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {selected.size > 0 && (
                <div className="space-y-2 border-t border-pastel-border pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-pastel-text/60">
                    Observaciones (opcionales)
                  </p>
                  {Array.from(selected.values()).map((extra) => {
                    const acc = accesorios.find(
                      (a) => a.id === extra.accesorioId,
                    );
                    if (!acc) return null;
                    return (
                      <Input
                        key={extra.accesorioId}
                        label={acc.nombre}
                        size="sm"
                        value={extra.observacion}
                        onValueChange={(v) =>
                          setObservacion(extra.accesorioId, v)
                        }
                        placeholder="Observación opcional..."
                      />
                    );
                  })}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={handleCancel}>
                Cancelar
              </Button>
              <Button
                color="primary"
                isLoading={confirming}
                onPress={handleConfirm}
              >
                Confirmar retiro
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
