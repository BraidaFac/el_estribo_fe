"use client";

import { cancelarBloqueo } from "@/lib/services/v2";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { useState } from "react";
import { toast } from "sonner";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";

type CancelBlockActionProps = {
  bloqueoId: number;
  isDisabled?: boolean;
  onCancelled?: () => void;
};

export function CancelBlockAction({
  bloqueoId,
  isDisabled,
  onCancelled,
}: CancelBlockActionProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [motivo, setMotivo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setMotivo("");
    onOpenChange();
  };

  const handleCancelBlock = async () => {
    if (!motivo.trim()) {
      toast.error("Debes ingresar un motivo de cancelacion");
      return;
    }

    try {
      setIsSubmitting(true);
      await cancelarBloqueo(bloqueoId, { motivoCancelacion: motivo.trim() });
      toast.success("Bloqueo cancelado correctamente");
      onCancelled?.();
      handleClose();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        color="danger"
        variant="flat"
        isDisabled={isDisabled}
        onPress={onOpen}
      >
        Cancelar bloqueo
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={handleClose}>
        <ModalContent>
          <>
            <ModalHeader>Cancelar bloqueo</ModalHeader>
            <ModalBody>
              <Textarea
                isRequired
                label="Motivo de cancelacion"
                value={motivo}
                onValueChange={setMotivo}
                placeholder="Ej: Se decide liberar el pantalon para otro evento"
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={handleClose}>
                Volver
              </Button>
              <Button
                color="danger"
                onPress={handleCancelBlock}
                isLoading={isSubmitting}
              >
                Confirmar cancelacion
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </>
  );
}
