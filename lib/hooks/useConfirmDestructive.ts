import type {
  ConfirmModalRef,
  ConfirmModalVariant,
} from "@/lib/components/ConfirmModal";
import { useCallback, useRef } from "react";

export type ConfirmDestructiveOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmModalVariant;
  action: () => Promise<void>;
};

/**
 * Patrón reutilizable: montar `<ConfirmModal ref={confirmModalRef} />` y llamar `confirmDestructive`.
 * Devuelve true solo si el usuario confirmó y `action` terminó sin lanzar.
 */
export function useConfirmDestructive() {
  const confirmModalRef = useRef<ConfirmModalRef>(null);

  const confirmDestructive = useCallback(
    async (opts: ConfirmDestructiveOptions) => {
      const result = await confirmModalRef.current?.openModal({
        title: opts.title,
        message: opts.message,
        confirmText: opts.confirmText ?? "Confirmar",
        cancelText: opts.cancelText ?? "Cancelar",
        variant: opts.variant ?? "danger",
        onConfirm: opts.action,
      });
      return result === true;
    },
    [],
  );

  return { confirmModalRef, confirmDestructive };
}
