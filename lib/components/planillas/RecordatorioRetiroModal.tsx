"use client";

import {
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useState } from "react";

const TAREAS = [
  "Facturar la garantía",
  "Facturar el alquiler",
  "Entregar la planilla de recomendación",
];

type Props = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirming?: boolean;
};

export function RecordatorioRetiroModal({
  isOpen,
  onConfirm,
  onCancel,
  confirming = false,
}: Props) {
  const [listo, setListo] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setListo(false);
      onCancel();
    }
  };

  const handleConfirm = () => {
    setListo(false);
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      backdrop="blur"
      size="sm"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b border-pastel-border">
              <span>Estás por entregar el traje 👇</span>
            </ModalHeader>
            <ModalBody className="gap-4 py-4">
              <p className="text-sm text-pastel-text/70">
                Antes de continuar, asegurate de:
              </p>
              <ul className="space-y-2">
                {TAREAS.map((tarea) => (
                  <li
                    key={tarea}
                    className="flex items-center gap-2 text-sm text-pastel-text"
                  >
                    <span className="text-green-600">✔</span>
                    {tarea}
                  </li>
                ))}
              </ul>
              <div className="border-t border-pastel-border pt-3">
                <Checkbox
                  isSelected={listo}
                  onValueChange={setListo}
                  size="md"
                >
                  <span className="text-sm font-medium text-pastel-text">
                    Tareas realizadas
                  </span>
                </Checkbox>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onCancel}>
                Cancelar
              </Button>
              <Button
                color="primary"
                isDisabled={!listo}
                isLoading={confirming}
                onPress={handleConfirm}
              >
                Retirar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
