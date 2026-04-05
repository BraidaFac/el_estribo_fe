"use client";

import ConfirmModal from "@/lib/components/ConfirmModal";
import {
  ACCESORIOS_ICON_LABELS,
  ACCESORIOS_ICON_OPTIONS,
  getAccesorioIcon,
} from "@/lib/domain/accesorios/iconosAccesorios";
import type {
  AccesorioItem,
  CreateAccesorioPayload,
  UpdateAccesorioPayload,
} from "@/lib/domain/accesorios/types";
import { useConfirmDestructive } from "@/lib/hooks/useConfirmDestructive";
import {
  actualizarAccesorio,
  crearAccesorio,
  eliminarAccesorio,
  listarAccesorios,
} from "@/lib/services/v2/accesorios-v2.service";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import { TABLE_HEADER_CLASS } from "@/lib/utils/uiStyles";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type AccesorioForm = {
  nombre: string;
  icono: string;
};

type ModalMode =
  | { mode: "create" }
  | { mode: "edit"; accesorio: AccesorioItem };

const EMPTY_FORM: AccesorioForm = { nombre: "", icono: "TbHanger" };

export function AccesoriosPage() {
  const { confirmModalRef, confirmDestructive } = useConfirmDestructive();
  const [accesorios, setAccesorios] = useState<AccesorioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [form, setForm] = useState<AccesorioForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setAccesorios(await listarAccesorios());
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const abrirCrear = () => {
    setForm(EMPTY_FORM);
    setModalMode({ mode: "create" });
  };

  const abrirEditar = (accesorio: AccesorioItem) => {
    setForm({ nombre: accesorio.nombre, icono: accesorio.icono });
    setModalMode({ mode: "edit", accesorio });
  };

  const cerrarModal = () => setModalMode(null);

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!form.icono) {
      toast.error("El ícono es obligatorio");
      return;
    }

    try {
      setSaving(true);
      if (modalMode?.mode === "create") {
        const payload: CreateAccesorioPayload = {
          nombre: form.nombre.trim(),
          icono: form.icono,
        };
        await crearAccesorio(payload);
        toast.success("Accesorio creado");
      } else if (modalMode?.mode === "edit") {
        const payload: UpdateAccesorioPayload = {
          nombre: form.nombre.trim(),
          icono: form.icono,
        };
        await actualizarAccesorio(modalMode.accesorio.id, payload);
        toast.success("Accesorio actualizado");
      }
      cerrarModal();
      await cargar();
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = (accesorio: AccesorioItem) => {
    void confirmDestructive({
      title: "Eliminar accesorio",
      message: `¿Eliminar el accesorio "${accesorio.nombre}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      variant: "danger",
      action: async () => {
        await eliminarAccesorio(accesorio.id);
        toast.success("Accesorio eliminado");
        await cargar();
      },
    });
  };

  const isOpen = modalMode !== null;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <ConfirmModal ref={confirmModalRef} />

      <Modal
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) cerrarModal();
        }}
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => {
            const IconPreview = form.icono ? getAccesorioIcon(form.icono) : null;
            return (
              <>
                <ModalHeader>
                  {modalMode?.mode === "create"
                    ? "Nuevo accesorio"
                    : "Editar accesorio"}
                </ModalHeader>
                <ModalBody className="gap-3">
                  <Input
                    label="Nombre"
                    isRequired
                    value={form.nombre}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, nombre: v }))
                    }
                    autoComplete="off"
                  />
                  <Select
                    label="Ícono"
                    selectedKeys={form.icono ? [form.icono] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      if (selected) setForm((f) => ({ ...f, icono: selected }));
                    }}
                  >
                    {ACCESORIOS_ICON_OPTIONS.map((key) => {
                      const Icon = getAccesorioIcon(key);
                      return (
                        <SelectItem
                          key={key}
                          startContent={
                            <Icon className="h-4 w-4" aria-hidden />
                          }
                        >
                          {ACCESORIOS_ICON_LABELS[key] ?? key}
                        </SelectItem>
                      );
                    })}
                  </Select>
                  {IconPreview && (
                    <div className="flex items-center gap-2 text-sm text-pastel-text/70">
                      <IconPreview className="h-6 w-6" aria-hidden />
                      <span>Vista previa</span>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button variant="flat" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button
                    color="primary"
                    isLoading={saving}
                    onPress={() => void handleGuardar()}
                  >
                    {modalMode?.mode === "create" ? "Crear" : "Guardar"}
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>

      <div className="rounded-lg border border-pastel-border bg-pastel-surface p-4">
        <h1 className="text-2xl font-semibold text-pastel-text">Accesorios</h1>
        <Button size="sm" color="primary" className="mt-3" onPress={abrirCrear}>
          Nuevo accesorio
        </Button>
      </div>

      {loading ? (
        <div className="flex h-28 items-center justify-center">
          <Spinner color="secondary" />
        </div>
      ) : (
        <Table aria-label="Accesorios">
          <TableHeader>
            <TableColumn className={TABLE_HEADER_CLASS}>Nombre</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Ícono</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Acciones</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay accesorios registrados.">
            {accesorios.map((a) => {
              const Icon = getAccesorioIcon(a.icono);
              return (
                <TableRow key={a.id}>
                  <TableCell>{a.nombre}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-pastel-text/70" aria-hidden />
                      <span className="text-sm text-pastel-text/60">
                        {ACCESORIOS_ICON_LABELS[a.icono] ?? a.icono}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => abrirEditar(a)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => handleEliminar(a)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
