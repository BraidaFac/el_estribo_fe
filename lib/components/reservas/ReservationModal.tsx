"use client";

import { useReservationFlow } from "@/lib/hooks/useReservationFlow";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import { formatApiDateForUi } from "@/lib/utils/formatApiDate";
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
import { toast } from "sonner";
import { PantalonSelect } from "./PantalonSelect";

type ReservationModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sacoId: number | null;
  fechaReserva: string | null;
  onReservationCreated?: () => void;
};

export function ReservationModal({
  isOpen,
  onOpenChange,
  sacoId,
  fechaReserva,
  onReservationCreated,
}: ReservationModalProps) {
  const {
    form,
    setForm,
    pantalones,
    isBootstrapLoading,
    isSubmitting,
    loadError,
    validacionFechaError,
    ofertaUltimoMomento,
    reservaUltimoMomento,
    setReservaUltimoMomento,
    fieldErrors,
    canSubmit,
    submit,
    reset,
  } = useReservationFlow({
    isOpen,
    sacoId,
    fechaReserva,
  });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    try {
      await submit();
      toast.success("Reserva creada correctamente");
      onReservationCreated?.();
      handleClose();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={handleClose}
      placement="center"
      backdrop="blur"
      className="max-h-[90dvh] overflow-auto"
    >
      <ModalContent>
        <>
          <ModalHeader className="flex flex-col gap-1">
            Nueva reserva
          </ModalHeader>
          <ModalBody>
            <p className="sr-only" aria-live="polite">
              {loadError ??
                (isSubmitting
                  ? "Guardando reserva"
                  : "Formulario de reserva cargado")}
            </p>
            <div className="rounded border border-pastel-border bg-pastel-soft p-2 text-sm text-pastel-text">
              <p>
                <span className="font-semibold">Saco ID:</span> {sacoId ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Fecha:</span>{" "}
                {fechaReserva ? formatApiDateForUi(fechaReserva) : "-"}
              </p>
            </div>

            {isBootstrapLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Spinner color="secondary" />
              </div>
            ) : (
              <>
                {loadError && (
                  <div className="rounded border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
                    {loadError}
                  </div>
                )}
                {validacionFechaError && (
                  <div
                    className={
                      validacionFechaError
                        ? "rounded border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700"
                        : "rounded border border-pastel-border bg-pastel-soft p-2 text-sm text-pastel-text/80"
                    }
                    role={validacionFechaError ? "alert" : "status"}
                  >
                    {validacionFechaError ??
                      "Comprobando que la fecha sea factible con medición, modista y días hábiles…"}
                  </div>
                )}

                {ofertaUltimoMomento && validacionFechaError && (
                  <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                    <Checkbox
                      classNames={{ label: "text-sm" }}
                      isSelected={reservaUltimoMomento}
                      onValueChange={setReservaUltimoMomento}
                    >
                      Reserva a último momento.
                    </Checkbox>
                  </div>
                )}

                <Input
                  isRequired
                  label="DNI del cliente"
                  value={form.clienteDni}
                  isInvalid={!!fieldErrors.clienteDni}
                  errorMessage={fieldErrors.clienteDni}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, clienteDni: value }))
                  }
                />
                <Input
                  isRequired
                  label="Nombre del cliente"
                  value={form.clienteNombre}
                  isInvalid={!!fieldErrors.clienteNombre}
                  errorMessage={fieldErrors.clienteNombre}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, clienteNombre: value }))
                  }
                />
                <Input
                  label="Nombre de la cuenta"
                  value={form.nombreCuenta}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, nombreCuenta: value }))
                  }
                />

                <Input
                  label="Telefono"
                  value={form.clienteTelefono}
                  isInvalid={!!fieldErrors.clienteTelefono}
                  errorMessage={fieldErrors.clienteTelefono}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, clienteTelefono: value }))
                  }
                />

                <PantalonSelect
                  value={form.pantalonId}
                  options={pantalones}
                  isDisabled={pantalones.length === 0}
                  onChange={(id) =>
                    setForm((prev) => ({ ...prev, pantalonId: id }))
                  }
                />
                {fieldErrors.pantalonId && (
                  <p className="text-xs text-red-600">
                    {fieldErrors.pantalonId}
                  </p>
                )}
                {pantalones.length === 0 && (
                  <p className="text-xs text-pastel-text/80">
                    No hay pantalones disponibles para esta fecha. Puedes
                    continuar sin pantalon.
                  </p>
                )}

                <p className="text-xs text-pastel-text/80">
                  La lavandería y la modista se asignan más adelante, al
                  registrar el envío operativo desde las planillas
                  correspondientes.
                </p>

                <Textarea
                  label="Observaciones"
                  value={form.observaciones}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, observaciones: value }))
                  }
                />
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleClose}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              isDisabled={!canSubmit || isBootstrapLoading}
            >
              Confirmar reserva
            </Button>
          </ModalFooter>
        </>
      </ModalContent>
    </Modal>
  );
}
