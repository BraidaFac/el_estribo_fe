"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  nombreModista: string;
  isLoading: boolean;
  onConfirmar: (costoModista: number) => void;
};

export function RecibirModistaModal({
  isOpen,
  onOpenChange,
  nombreModista,
  isLoading,
  onConfirmar,
}: Props) {
  const [valor, setValor] = useState("");

  const costoNum = valor.trim() === "" ? null : Number(valor.replace(",", "."));
  const esValido = costoNum !== null && Number.isFinite(costoNum) && costoNum >= 0;

  const handleConfirmar = () => {
    if (!esValido || costoNum === null) return;
    onConfirmar(costoNum);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) setValor("");
    onOpenChange(open);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      placement="center"
      backdrop="blur"
      className="border border-pastel-border bg-pastel-surface"
    >
      <ModalContent>
        <ModalHeader className="text-pastel-text">
          Recibir de modista
        </ModalHeader>
        <ModalBody className="gap-3 text-pastel-text">
          <p className="text-sm text-pastel-text/80">
            ¿Cuánto cobró la modista{" "}
            <span className="font-semibold">{nombreModista}</span>?
          </p>
          <Input
            label="Monto total ($)"
            placeholder="0"
            type="text"
            inputMode="decimal"
            value={valor}
            onValueChange={setValor}
            isInvalid={valor.trim() !== "" && !esValido}
            errorMessage="Ingresá un valor válido mayor o igual a 0"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            color="primary"
            isDisabled={!esValido}
            isLoading={isLoading}
            onPress={handleConfirmar}
          >
            Confirmar recepción
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
