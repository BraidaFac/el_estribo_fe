import React, { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";

export type ConfirmModalVariant = "info" | "warning" | "danger";

export type ConfirmModalRef = {
  openModal: () => Promise<boolean>;
};

type ConfirmModalProps = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
};

const ConfirmationModal = forwardRef<ConfirmModalRef, ConfirmModalProps>(
  (
    {
      title = "Confirmación",
      message = "¿Desea confirmar?",
      confirmText = "Confirmar",
      cancelText = "Cancelar",
      variant = "warning",
    },
    ref,
  ) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [resolvePromise, setResolvePromise] = useState<
      ((value: boolean) => void) | null
    >(null);

    const confirmColor = useMemo(() => {
      if (variant === "danger") return "danger";
      if (variant === "info") return "primary";
      return "warning";
    }, [variant]);

    useImperativeHandle(ref, () => ({
      openModal: () =>
        new Promise<boolean>((resolve) => {
          onOpen();
          setResolvePromise(() => resolve);
        }),
    }));

    const resolveAndClose = (value: boolean) => {
      if (resolvePromise) {
        resolvePromise(value);
        setResolvePromise(null);
      }
      onClose();
    };

    return (
      <Modal
        closeButton
        aria-labelledby="modal-title"
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              {title}
            </ModalHeader>
            <ModalBody>{message}</ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={() => resolveAndClose(false)}>
                {cancelText}
              </Button>
              <Button color={confirmColor} onPress={() => resolveAndClose(true)}>
                {confirmText}
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    );
  }
);
// Define un nombre para depuración
ConfirmationModal.displayName = "ConfirmationModal";
export default ConfirmationModal;
