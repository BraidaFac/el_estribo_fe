"use client";

import ConfirmModal from "@/lib/components/ConfirmModal";
import { useConfirmDestructive } from "@/lib/hooks/useConfirmDestructive";
import { ACTION_BUTTON_BASE_CLASS, ACTION_BUTTON_CLASSES, TABLE_HEADER_CLASS } from "@/lib/utils/uiStyles";
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
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ContactoBase = {
  id: number;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  predeterminada: boolean;
};

type ContactoForm = {
  nombre: string;
  telefono: string;
  direccion: string;
  predeterminada: boolean;
};

const INITIAL_FORM: ContactoForm = {
  nombre: "",
  telefono: "",
  direccion: "",
  predeterminada: false,
};

type ContactoCrudPageProps<T extends ContactoBase> = {
  title: string;
  entityLabel: string;
  listFn: () => Promise<T[]>;
  createFn: (payload: {
    nombre: string;
    telefono?: string;
    direccion?: string;
    predeterminada?: boolean;
  }) => Promise<T>;
  updateFn: (
    id: number,
    payload: {
      nombre?: string;
      telefono?: string;
      direccion?: string;
      predeterminada?: boolean;
    },
  ) => Promise<T>;
  deleteFn: (id: number) => Promise<{ message: string }>;
  setDefaultFn: (id: number) => Promise<void>;
  /** Texto del cuerpo del modal de confirmación al eliminar (por fila). */
  deleteConfirmMessage?: (row: T) => string;
};

export function ContactoCrudPage<T extends ContactoBase>({
  title,
  entityLabel,
  listFn,
  createFn,
  updateFn,
  deleteFn,
  setDefaultFn,
  deleteConfirmMessage,
}: ContactoCrudPageProps<T>) {
  const { confirmModalRef, confirmDestructive } = useConfirmDestructive();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [rows, setRows] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [form, setForm] = useState<ContactoForm>(INITIAL_FORM);

  const isEdit = Boolean(editingRow);
  const submitDisabled = useMemo(
    () => !form.nombre.trim() || isSubmitting,
    [form.nombre, isSubmitting],
  );

  const resetForm = () => {
    setEditingRow(null);
    setForm(INITIAL_FORM);
  };

  const refresh = async () => {
    setIsLoading(true);
    try {
      const data = await listFn();
      setRows(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `No se pudo cargar ${entityLabel}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenCreate = () => {
    resetForm();
    onOpen();
  };

  const handleOpenEdit = (row: T) => {
    setEditingRow(row);
    setForm({
      nombre: row.nombre ?? "",
      telefono: row.telefono ?? "",
      direccion: row.direccion ?? "",
      predeterminada: row.predeterminada,
    });
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
        predeterminada: form.predeterminada,
      };

      if (editingRow) {
        await updateFn(editingRow.id, payload);
        toast.success(`${entityLabelCapitalized} actualizada`);
      } else {
        await createFn(payload);
        toast.success(`${entityLabelCapitalized} creada`);
      }

      await refresh();
      onOpenChange();
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `No se pudo guardar ${entityLabelCapitalized}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = (row: T) => {
    void confirmDestructive({
      title: `Eliminar ${entityLabelCapitalized}`,
      message:
        deleteConfirmMessage?.(row) ??
        `¿Seguro que querés eliminar este registro de ${entityLabel}?`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      action: async () => {
        try {
          await deleteFn(row.id);
          toast.success(`${entityLabelCapitalized} eliminada`);
          await refresh();
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : `No se pudo eliminar ${entityLabel}`,
          );
          throw error;
        }
      },
    });
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultFn(id);
      toast.success(`${entityLabelCapitalized} marcada como predeterminada`);
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `No se pudo actualizar ${entityLabel}`,
      );
    }
  };

  const entityLabelCapitalized = entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1);
  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between rounded-lg border border-pastel-border bg-pastel-surface p-4">
        <h1 className="text-2xl font-semibold text-pastel-text">{entityLabelCapitalized}</h1>
        <Button
          className={`${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.success}`}
          onPress={handleOpenCreate}
        >
          Nuevo
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Spinner color="secondary" />
        </div>
      ) : (
        <Table aria-label={`Tabla de ${entityLabelCapitalized}`}>
          <TableHeader>
            <TableColumn className={TABLE_HEADER_CLASS}>Nombre</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Telefono</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Direccion</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Acciones</TableColumn>
          </TableHeader>
          <TableBody emptyContent={`No hay ${entityLabelCapitalized.toLowerCase()}`}>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.nombre}</TableCell>
                <TableCell>{row.telefono ?? "-"}</TableCell>
                <TableCell>{row.direccion ?? "-"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className={`${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.edit}`}
                      onPress={() => handleOpenEdit(row)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      className={`${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.delete}`}
                      onPress={() => handleDeleteRequest(row)}
                    >
                      Eliminar
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      title={
                        row.predeterminada
                          ? "Ya es la predeterminada"
                          : "Marcar como predeterminada sin editar"
                      }
                      isDisabled={row.predeterminada}
                      onPress={() => handleSetDefault(row.id)}
                    >
                      Predeterminada
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmModal ref={confirmModalRef} />

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={resetForm}>
        <ModalContent>
          <>
            <ModalHeader>{isEdit ? `Editar ${entityLabelCapitalized}` : `Nueva ${entityLabelCapitalized}`}</ModalHeader>
            <ModalBody>
              <Input
                isRequired
                label="Nombre"
                value={form.nombre}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, nombre: value }))
                }
              />
              <Input
                label="Telefono"
                value={form.telefono}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, telefono: value }))
                }
              />
              <Input
                label="Direccion"
                value={form.direccion}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, direccion: value }))
                }
              />
              <Checkbox
                isSelected={form.predeterminada}
                onValueChange={(checked) =>
                  setForm((prev) => ({ ...prev, predeterminada: checked }))
                }
              >
                Marcar como predeterminada
              </Checkbox>
              <p className="text-xs text-pastel-text/70">
                Solo puede haber una predeterminada; al marcarla, el resto se desmarca
                automáticamente.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onOpenChange}>
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={submitDisabled}
              >
                Guardar
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </div>
  );
}
