"use client";

import ConfirmModal from "@/lib/components/ConfirmModal";
import { useConfirmDestructive } from "@/lib/hooks/useConfirmDestructive";
import type { Lavanderia, PrecioHistoricoLavanderia } from "@/lib/domain/reservas/types";
import {
  actualizarLavanderia,
  actualizarPrecioLavanderia,
  agregarPrecioLavanderia,
  crearLavanderia,
  eliminarLavanderia,
  eliminarPrecioLavanderia,
  listarLavanderias,
  listarPreciosLavanderia,
  setLavanderiaPredeterminada,
} from "@/lib/services/v2/lavanderias-v2.service";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import {
  ACTION_BUTTON_BASE_CLASS,
  ACTION_BUTTON_CLASSES,
  TABLE_HEADER_CLASS,
} from "@/lib/utils/uiStyles";
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
import { useEffect, useState } from "react";
import { toast } from "sonner";

type LavanderiaForm = {
  nombre: string;
  telefono: string;
  direccion: string;
  predeterminada: boolean;
};

type PrecioForm = {
  precio: string;
  vigenciaDesde: string;
};

const INITIAL_FORM: LavanderiaForm = {
  nombre: "",
  telefono: "",
  direccion: "",
  predeterminada: false,
};

const INITIAL_PRECIO_FORM: PrecioForm = { precio: "", vigenciaDesde: "" };

function formatPrecio(precio: number | null): string {
  if (precio === null) return "-";
  return `$${precio.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function LavanderiasCrudPage() {
  const { confirmModalRef, confirmDestructive } = useConfirmDestructive();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [rows, setRows] = useState<Lavanderia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRow, setEditingRow] = useState<Lavanderia | null>(null);
  const [form, setForm] = useState<LavanderiaForm>(INITIAL_FORM);

  // Precios
  const [precios, setPrecios] = useState<PrecioHistoricoLavanderia[]>([]);
  const [preciosLoading, setPreciosLoading] = useState(false);
  const [nuevoPrecioForm, setNuevoPrecioForm] = useState<PrecioForm>(INITIAL_PRECIO_FORM);
  const [showNuevoPrecio, setShowNuevoPrecio] = useState(false);
  const [savingNuevoPrecio, setSavingNuevoPrecio] = useState(false);
  const [editingPrecioId, setEditingPrecioId] = useState<number | null>(null);
  const [editingPrecioForm, setEditingPrecioForm] = useState<PrecioForm>(INITIAL_PRECIO_FORM);
  const [savingPrecioId, setSavingPrecioId] = useState<number | null>(null);

  const isEdit = Boolean(editingRow);
  const submitDisabled = !form.nombre.trim() || isSubmitting;

  const refresh = async () => {
    setIsLoading(true);
    try {
      setRows(await listarLavanderias());
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPrecios = async (id: number) => {
    setPreciosLoading(true);
    try {
      setPrecios(await listarPreciosLavanderia(id));
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setPreciosLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const resetForm = () => {
    setEditingRow(null);
    setForm(INITIAL_FORM);
    setPrecios([]);
    setShowNuevoPrecio(false);
    setNuevoPrecioForm(INITIAL_PRECIO_FORM);
    setEditingPrecioId(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    onOpen();
  };

  const handleOpenEdit = (row: Lavanderia) => {
    setEditingRow(row);
    setForm({
      nombre: row.nombre ?? "",
      telefono: row.telefono ?? "",
      direccion: row.direccion ?? "",
      predeterminada: row.predeterminada,
    });
    setShowNuevoPrecio(false);
    setEditingPrecioId(null);
    onOpen();
    void refreshPrecios(row.id);
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
        await actualizarLavanderia(editingRow.id, payload);
        toast.success("Lavandería actualizada");
      } else {
        await crearLavanderia(payload);
        toast.success("Lavandería creada");
      }
      await refresh();
      onOpenChange();
      resetForm();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (row: Lavanderia) => {
    void confirmDestructive({
      title: "Eliminar Lavandería",
      message: `¿Seguro que querés eliminar "${row.nombre}"?`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      action: async () => {
        try {
          await eliminarLavanderia(row.id);
          toast.success("Lavandería eliminada");
          await refresh();
        } catch (error) {
          toast.error(getUserFacingErrorMessage(error));
          throw error;
        }
      },
    });
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setLavanderiaPredeterminada(id);
      toast.success("Lavandería marcada como predeterminada");
      await refresh();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    }
  };

  // ── Precios ──────────────────────────────────────────────────────────────────

  const handleAgregarPrecio = async () => {
    if (!editingRow) return;
    const precio = parseFloat(nuevoPrecioForm.precio.replace(",", "."));
    if (!precio || precio <= 0 || !nuevoPrecioForm.vigenciaDesde) {
      toast.error("Ingresá un precio válido y una fecha de vigencia");
      return;
    }
    try {
      setSavingNuevoPrecio(true);
      await agregarPrecioLavanderia(editingRow.id, {
        precio,
        vigenciaDesde: nuevoPrecioForm.vigenciaDesde,
      });
      toast.success("Precio agregado");
      setNuevoPrecioForm(INITIAL_PRECIO_FORM);
      setShowNuevoPrecio(false);
      await refreshPrecios(editingRow.id);
      await refresh();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setSavingNuevoPrecio(false);
    }
  };

  const handleEditarPrecio = (p: PrecioHistoricoLavanderia) => {
    setEditingPrecioId(p.id);
    setEditingPrecioForm({
      precio: String(p.precio),
      vigenciaDesde: p.vigenciaDesde,
    });
  };

  const handleGuardarPrecio = async (precioId: number) => {
    if (!editingRow) return;
    const precio = parseFloat(editingPrecioForm.precio.replace(",", "."));
    if (!precio || precio <= 0) {
      toast.error("Ingresá un precio válido");
      return;
    }
    try {
      setSavingPrecioId(precioId);
      await actualizarPrecioLavanderia(editingRow.id, precioId, {
        precio,
        vigenciaDesde: editingPrecioForm.vigenciaDesde,
      });
      toast.success("Precio actualizado");
      setEditingPrecioId(null);
      await refreshPrecios(editingRow.id);
      await refresh();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setSavingPrecioId(null);
    }
  };

  const handleEliminarPrecio = (p: PrecioHistoricoLavanderia) => {
    if (!editingRow) return;
    void confirmDestructive({
      title: "Eliminar precio",
      message: `¿Eliminás el precio $${p.precio} (vigente desde ${p.vigenciaDesde})?`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      action: async () => {
        try {
          await eliminarPrecioLavanderia(editingRow.id, p.id);
          toast.success("Precio eliminado");
          await refreshPrecios(editingRow.id);
          await refresh();
        } catch (error) {
          toast.error(getUserFacingErrorMessage(error));
          throw error;
        }
      },
    });
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between rounded-lg border border-pastel-border bg-pastel-surface p-4">
        <h1 className="text-2xl font-semibold text-pastel-text">Lavanderías</h1>
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
        <Table aria-label="Tabla de Lavanderías">
          <TableHeader>
            <TableColumn className={TABLE_HEADER_CLASS}>Nombre</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Teléfono</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Dirección</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Precio actual</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Acciones</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay lavanderías">
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.nombre}</TableCell>
                <TableCell>{row.telefono ?? "-"}</TableCell>
                <TableCell>{row.direccion ?? "-"}</TableCell>
                <TableCell>{formatPrecio(row.precioActual)}</TableCell>
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
                      onPress={() => handleDelete(row)}
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
                          : "Marcar como predeterminada"
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

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={resetForm}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <>
            <ModalHeader>
              {isEdit ? "Editar Lavandería" : "Nueva Lavandería"}
            </ModalHeader>
            <ModalBody>
              {/* ── Datos básicos ────────────────────────────────────────── */}
              <Input
                isRequired
                label="Nombre"
                value={form.nombre}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, nombre: value }))
                }
              />
              <Input
                label="Teléfono"
                value={form.telefono}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, telefono: value }))
                }
              />
              <Input
                label="Dirección"
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
                Solo puede haber una predeterminada; al marcarla, el resto se
                desmarca automáticamente.
              </p>

              {/* ── Historial de precios (solo en edición) ───────────────── */}
              {isEdit && (
                <div className="mt-4 border-t border-pastel-border pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-pastel-text">
                      Historial de precios de lavado
                    </p>
                    {!showNuevoPrecio && (
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        onPress={() => setShowNuevoPrecio(true)}
                      >
                        + Agregar precio
                      </Button>
                    )}
                  </div>

                  {showNuevoPrecio && (
                    <div className="mb-3 flex flex-wrap items-end gap-2 rounded-lg border border-pastel-border bg-pastel-surface/60 p-3">
                      <Input
                        size="sm"
                        label="Precio ($)"
                        className="w-32"
                        value={nuevoPrecioForm.precio}
                        onValueChange={(v) =>
                          setNuevoPrecioForm((prev) => ({ ...prev, precio: v }))
                        }
                      />
                      <Input
                        size="sm"
                        type="date"
                        label="Vigente desde"
                        className="w-44"
                        value={nuevoPrecioForm.vigenciaDesde}
                        onValueChange={(v) =>
                          setNuevoPrecioForm((prev) => ({
                            ...prev,
                            vigenciaDesde: v,
                          }))
                        }
                      />
                      <Button
                        size="sm"
                        color="primary"
                        isLoading={savingNuevoPrecio}
                        onPress={handleAgregarPrecio}
                      >
                        Guardar
                      </Button>
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => {
                          setShowNuevoPrecio(false);
                          setNuevoPrecioForm(INITIAL_PRECIO_FORM);
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}

                  {preciosLoading ? (
                    <div className="flex h-16 items-center justify-center">
                      <Spinner size="sm" color="secondary" />
                    </div>
                  ) : precios.length === 0 ? (
                    <p className="text-xs text-pastel-text/50">
                      Sin precios registrados todavía.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {precios.map((p) => (
                        <div
                          key={p.id}
                          className="flex flex-wrap items-center gap-2 rounded-md border border-pastel-border px-3 py-2"
                        >
                          {editingPrecioId === p.id ? (
                            <>
                              <Input
                                size="sm"
                                label="Precio ($)"
                                className="w-32"
                                value={editingPrecioForm.precio}
                                onValueChange={(v) =>
                                  setEditingPrecioForm((prev) => ({
                                    ...prev,
                                    precio: v,
                                  }))
                                }
                              />
                              <Input
                                size="sm"
                                type="date"
                                label="Vigente desde"
                                className="w-44"
                                value={editingPrecioForm.vigenciaDesde}
                                onValueChange={(v) =>
                                  setEditingPrecioForm((prev) => ({
                                    ...prev,
                                    vigenciaDesde: v,
                                  }))
                                }
                              />
                              <Button
                                size="sm"
                                color="primary"
                                isLoading={savingPrecioId === p.id}
                                onPress={() => handleGuardarPrecio(p.id)}
                              >
                                Guardar
                              </Button>
                              <Button
                                size="sm"
                                variant="light"
                                onPress={() => setEditingPrecioId(null)}
                              >
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 text-sm font-semibold text-pastel-text">
                                {formatPrecio(p.precio)}
                              </span>
                              <span className="text-xs text-pastel-text/60">
                                desde {p.vigenciaDesde}
                              </span>
                              <Button
                                size="sm"
                                className={`${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.edit}`}
                                onPress={() => handleEditarPrecio(p)}
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                className={`${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.delete}`}
                                onPress={() => handleEliminarPrecio(p)}
                              >
                                Eliminar
                              </Button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
