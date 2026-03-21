"use client";

import ConfirmModal from "@/lib/components/ConfirmModal";
import {
    resumenLavanderiasReservaDetalle,
    resumenModistasReservaDetalle,
} from "@/lib/domain/reservas/asignacionesServicio";
import {
    getEstadoReservaLabel,
    getEstadoUbicacionPrendaLabel,
} from "@/lib/domain/reservas/labels";
import { Reserva, UpdateReservaV2Payload } from "@/lib/domain/reservas/types";
import { useConfirmDestructive } from "@/lib/hooks/useConfirmDestructive";
import {
    actualizarReservaV2,
    cancelarReservaV2,
    marcarReservaDevuelta,
    marcarReservaRetirada,
} from "@/lib/services/v2";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import {
    formatApiDateForUi,
    formatApiDateTimeForUi,
    formatIsoDatesInText,
} from "@/lib/utils/formatApiDate";
import {
    Accordion,
    AccordionItem,
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Textarea,
} from "@heroui/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type ReservationActionsDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  reservas: Reserva[];
  onDataChanged?: () => Promise<void> | void;
};

function canRetirar(reserva: Reserva): boolean {
  if (reserva.accionesPermitidas) return reserva.accionesPermitidas.retirar.permitida;
  return reserva.estadoReserva === "CONFIRMADA";
}

function canCancelar(reserva: Reserva): boolean {
  if (reserva.accionesPermitidas) return reserva.accionesPermitidas.cancelar.permitida;
  return reserva.estadoReserva === "CONFIRMADA";
}

function canDevolver(reserva: Reserva): boolean {
  if (reserva.accionesPermitidas) return reserva.accionesPermitidas.devolver.permitida;
  return reserva.estadoReserva === "EN_CURSO";
}

function canEditar(reserva: Reserva): boolean {
  if (reserva.accionesPermitidas) return reserva.accionesPermitidas.editar.permitida;
  return reserva.estadoReserva !== "CANCELADA";
}

function getEstadoClass(estado: Reserva["estadoReserva"]): string {
  switch (estado) {
    case "CONFIRMADA":
      return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    case "EN_CURSO":
      return "bg-sky-100 text-sky-800 border border-sky-200";
    case "COMPLETADA":
      return "bg-zinc-100 text-zinc-700 border border-zinc-200";
    case "CANCELADA":
      return "bg-rose-100 text-rose-800 border border-rose-200";
    default:
      return "bg-amber-100 text-amber-800 border border-amber-200";
  }
}

export function ReservationActionsDialog({
  isOpen,
  onOpenChange,
  title,
  reservas,
  onDataChanged,
}: ReservationActionsDialogProps) {
  const { confirmModalRef, confirmDestructive } = useConfirmDestructive();
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState<{
    clienteNombre: string;
    clienteDni: string;
    nombreCuenta: string;
    clienteTelefono: string;
    observaciones: string;
  }>({
    clienteNombre: "",
    clienteDni: "",
    nombreCuenta: "",
    clienteTelefono: "",
    observaciones: "",
  });

  const sortedReservas = useMemo(
    () => [...reservas].sort((a, b) => a.id - b.id),
    [reservas],
  );

  const refresh = async () => {
    if (!onDataChanged) return;
    await onDataChanged();
  };

  const handleRetirar = async (reserva: Reserva) => {
    try {
      await marcarReservaRetirada(reserva.id);
      toast.success(`Reserva #${reserva.id} marcada como retirada`);
      onOpenChange(false);
      await refresh();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    }
  };

  const handleDevolver = async (reserva: Reserva) => {
    try {
      await marcarReservaDevuelta(reserva.id);
      toast.success(`Reserva #${reserva.id} marcada como devuelta`);
      onOpenChange(false);
      await refresh();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    }
  };

  const handleCancelarClick = (reserva: Reserva) => {
    void confirmDestructive({
      title: "Cancelar reserva",
      message: `¿Seguro que querés cancelar la reserva #${reserva.id} (${reserva.clienteNombre})?`,
      confirmText: "Sí, cancelar reserva",
      cancelText: "Volver",
      action: async () => {
        try {
          await cancelarReservaV2(reserva.id, "Cancelada desde acciones del calendario");
          toast.success(`Reserva #${reserva.id} cancelada`);
          onOpenChange(false);
          await refresh();
        } catch (error) {
          toast.error(getUserFacingErrorMessage(error));
          throw error;
        }
      },
    });
  };

  const openEditModal = (reserva: Reserva) => {
    setEditingReserva(reserva);
    setEditForm({
      clienteNombre: reserva.clienteNombre,
      clienteDni: reserva.clienteDni,
      nombreCuenta: reserva.nombreCuenta ?? "",
      clienteTelefono: reserva.clienteTelefono ?? "",
      observaciones: reserva.observaciones ?? "",
    });
  };

  const handleGuardarEdicion = async () => {
    if (!editingReserva) return;
    setIsSavingEdit(true);
    try {
      const payload: UpdateReservaV2Payload = {
        clienteNombre: editForm.clienteNombre,
        clienteDni: editForm.clienteDni,
        nombreCuenta: editForm.nombreCuenta || "",
        clienteTelefono: editForm.clienteTelefono || "",
        observaciones: editForm.observaciones || "",
      };
      await actualizarReservaV2(editingReserva.id, payload);
      toast.success(`Reserva #${editingReserva.id} actualizada`);
      setEditingReserva(null);
      onOpenChange(false);
      await refresh();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <>
      <ConfirmModal ref={confirmModalRef} />

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
        className="my-5 max-h-[90dvh] overflow-auto"
      >
        <ModalContent className="border border-pastel-border bg-pastel-surface/95">
          <ModalHeader className="border-b border-pastel-border/70 pb-4 text-xl font-semibold text-pastel-text">
            {title}
          </ModalHeader>
          <ModalBody>
            {sortedReservas.length > 0 ? (
              <Accordion
                variant="splitted"
                selectionMode="multiple"
                className="px-0"
                itemClasses={{
                  base: "bg-pastel-soft border border-pastel-border rounded-xl mb-2",
                  title: "text-pastel-text",
                  trigger: "px-4 py-3",
                  content: "px-4 pb-4",
                }}
              >
                {sortedReservas.map((reserva) => (
                  <AccordionItem
                    key={String(reserva.id)}
                    aria-label={`Reserva ${reserva.id}`}
                    title={
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-pastel-text">
                            Reserva #{reserva.id} - {reserva.clienteNombre}
                          </div>
                          <div className="truncate text-xs text-pastel-text/80">
                            Saco {reserva.saco.codigo}
                            {reserva.pantalon ? ` + Pantalón ${reserva.pantalon.codigo}` : " · Sin pantalón"}
                          </div>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${getEstadoClass(reserva.estadoReserva)}`}
                        >
                          {getEstadoReservaLabel(reserva.estadoReserva)}
                        </span>
                      </div>
                    }
                  >
                    <div className="grid grid-cols-1 gap-2 text-sm text-pastel-text md:grid-cols-2">
                      <p>
                        <strong>Saco:</strong> {reserva.saco.codigo} - {reserva.saco.marca}
                      </p>
                      <p>
                        <strong>Estado saco:</strong>{" "}
                        {getEstadoUbicacionPrendaLabel(reserva.saco.ubicacionActual)}
                      </p>
                      <p>
                        <strong>Pantalón:</strong>{" "}
                        {reserva.pantalon
                          ? `${reserva.pantalon.codigo} - ${reserva.pantalon.marca}`
                          : "Sin pantalón"}
                      </p>
                      <p>
                        <strong>Estado pantalón:</strong>{" "}
                        {reserva.pantalon
                          ? getEstadoUbicacionPrendaLabel(reserva.pantalon.ubicacionActual)
                          : "-"}
                      </p>
                      <p>
                        <strong>DNI:</strong> {reserva.clienteDni}
                      </p>
                      <p>
                        <strong>Cuenta:</strong> {reserva.nombreCuenta ?? "-"}
                      </p>
                      <p>
                        <strong>Teléfono:</strong> {reserva.clienteTelefono ?? "-"}
                      </p>
                      <p className="whitespace-pre-wrap">
                        <strong>Lavandería (saco / pantalón):</strong>{"\n"}
                        {resumenLavanderiasReservaDetalle(reserva)}
                      </p>
                      <p className="whitespace-pre-wrap">
                        <strong>Modista (saco / pantalón):</strong>{"\n"}
                        {resumenModistasReservaDetalle(reserva)}
                      </p>
                      <p>
                        <strong>Fecha reserva:</strong> {formatApiDateForUi(reserva.fechaReserva)}
                      </p>
                      <p>
                        <strong>Retirado:</strong>{" "}
                        {reserva.clienteRetiroAt
                          ? formatApiDateTimeForUi(reserva.clienteRetiroAt)
                          : "-"}
                      </p>
                      <p>
                        <strong>Devuelto:</strong>{" "}
                        {reserva.clienteDevolvioAt
                          ? formatApiDateTimeForUi(reserva.clienteDevolvioAt)
                          : "-"}
                      </p>
                    </div>

                    <div className="mt-3 rounded-lg border border-pastel-border bg-white/70 p-2 text-sm">
                      <strong>Observaciones:</strong>{" "}
                      {reserva.observaciones?.trim() ? reserva.observaciones : "Sin observaciones"}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-pastel-border pt-3">
                      {reserva.estadoReserva === "CONFIRMADA" && (
                        <Button
                          size="sm"
                          color="primary"
                          isDisabled={!canRetirar(reserva)}
                          onPress={() => handleRetirar(reserva)}
                        >
                          Registrar retiro en el local
                        </Button>
                      )}
                      {reserva.estadoReserva === "EN_CURSO" && (
                        <Button
                          size="sm"
                          color="secondary"
                          isDisabled={!canDevolver(reserva)}
                          onPress={() => handleDevolver(reserva)}
                        >
                          Registrar devolución en el local
                        </Button>
                      )}
                      {canEditar(reserva) && (
                        <Button size="sm" variant="flat" onPress={() => openEditModal(reserva)}>
                          Editar reserva
                        </Button>
                      )}
                      {reserva.estadoReserva === "CONFIRMADA" && (
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          isDisabled={!canCancelar(reserva)}
                          onPress={() => handleCancelarClick(reserva)}
                        >
                          Cancelar reserva
                        </Button>
                      )}
                    </div>
                    {reserva.estadoReserva === "CONFIRMADA" &&
                      !canRetirar(reserva) &&
                      reserva.accionesPermitidas?.retirar.motivo && (
                        <p className="mt-2 text-xs text-amber-700">
                          {formatIsoDatesInText(reserva.accionesPermitidas.retirar.motivo)}
                        </p>
                      )}
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="rounded-xl border border-pastel-border bg-pastel-soft p-6 text-center text-sm text-pastel-text/80">
                No hay reservas para este día.
              </div>
            )}
          </ModalBody>
          <ModalFooter className="border-t border-pastel-border/70 pt-4">
            <Button color="primary" variant="flat" onPress={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={!!editingReserva}
        onOpenChange={(open) => {
          if (!open) setEditingReserva(null);
        }}
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          <>
            <ModalHeader>Editar reserva #{editingReserva?.id}</ModalHeader>
            <ModalBody>
              <Input
                label="Nombre cliente"
                value={editForm.clienteNombre}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, clienteNombre: value }))
                }
              />
              <Input
                label="DNI cliente"
                value={editForm.clienteDni}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, clienteDni: value }))
                }
              />
              <Input
                label="Nombre de cuenta"
                value={editForm.nombreCuenta}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, nombreCuenta: value }))
                }
              />
              <Input
                label="Telefono"
                value={editForm.clienteTelefono}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, clienteTelefono: value }))
                }
              />
              <p className="text-xs text-pastel-text/75">
                Lavandería y modista se asignan por prenda desde las planillas operativas (no desde
                esta edición).
              </p>
              <Textarea
                label="Observaciones"
                value={editForm.observaciones}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, observaciones: value }))
                }
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => setEditingReserva(null)}>
                Cerrar
              </Button>
              <Button
                color="primary"
                onPress={handleGuardarEdicion}
                isLoading={isSavingEdit}
              >
                Guardar cambios
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </>
  );
}
