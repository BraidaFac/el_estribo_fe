import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";

export type ConfirmModalVariant = "info" | "warning" | "danger";

export type ConfirmModalOpenOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
  /** Si se pasa, el modal muestra loading en confirmar hasta que termine (éxito = cierra; error = queda abierto). */
  onConfirm?: () => Promise<void>;
};

export type ConfirmModalRef = {
  openModal: (options?: ConfirmModalOpenOptions) => Promise<boolean>;
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
    const [isOpen, setIsOpen] = useState(false);
    const [session, setSession] = useState<ConfirmModalOpenOptions | null>(null);
    const sessionRef = useRef<ConfirmModalOpenOptions | null>(null);
    const resolveRef = useRef<((value: boolean) => void) | null>(null);
    const [isConfirmLoading, setIsConfirmLoading] = useState(false);

    const clearSession = useCallback(() => {
      sessionRef.current = null;
      setSession(null);
    }, []);

    const openModal = useCallback((options?: ConfirmModalOpenOptions) => {
      const opts = options ?? {};
      sessionRef.current = opts;
      setSession(opts);
      setIsOpen(true);
      return new Promise<boolean>((resolve) => {
        resolveRef.current = resolve;
      });
    }, []);

    useImperativeHandle(ref, () => ({
      openModal,
    }));

    const closeWithoutResolve = useCallback(() => {
      setIsOpen(false);
    }, []);

    const resolveAndClose = useCallback(
      (value: boolean) => {
        if (resolveRef.current) {
          resolveRef.current(value);
          resolveRef.current = null;
        }
        clearSession();
        setIsConfirmLoading(false);
        closeWithoutResolve();
      },
      [clearSession, closeWithoutResolve],
    );

    const handleOpenChange = useCallback(
      (open: boolean) => {
        if (!open) {
          if (resolveRef.current) {
            resolveRef.current(false);
            resolveRef.current = null;
          }
          clearSession();
          setIsConfirmLoading(false);
        }
        setIsOpen(open);
      },
      [clearSession],
    );

    const handleConfirmPress = useCallback(() => {
      const opts = sessionRef.current;
      const runAsync = opts?.onConfirm;
      if (runAsync) {
        void (async () => {
          setIsConfirmLoading(true);
          try {
            await runAsync();
            resolveAndClose(true);
          } catch {
            setIsConfirmLoading(false);
          }
        })();
        return;
      }
      resolveAndClose(true);
    }, [resolveAndClose]);

    const displayTitle = session?.title ?? title;
    const displayMessage = session?.message ?? message;
    const displayConfirmText = session?.confirmText ?? confirmText;
    const displayCancelText = session?.cancelText ?? cancelText;
    const displayVariant = session?.variant ?? variant;

    const confirmColor = useMemo(() => {
      if (displayVariant === "danger") return "danger";
      if (displayVariant === "info") return "primary";
      return "warning";
    }, [displayVariant]);

    return (
      <Modal
        closeButton
        aria-labelledby="modal-title"
        isOpen={isOpen}
        onOpenChange={handleOpenChange}
        isDismissable={!isConfirmLoading}
        hideCloseButton={isConfirmLoading}
      >
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">{displayTitle}</ModalHeader>
            <ModalBody>{displayMessage}</ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                isDisabled={isConfirmLoading}
                onPress={() => resolveAndClose(false)}
              >
                {displayCancelText}
              </Button>
              <Button
                color={confirmColor}
                isLoading={isConfirmLoading}
                isDisabled={isConfirmLoading}
                onPress={handleConfirmPress}
              >
                {displayConfirmText}
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    );
  },
);
ConfirmationModal.displayName = "ConfirmationModal";
export default ConfirmationModal;
