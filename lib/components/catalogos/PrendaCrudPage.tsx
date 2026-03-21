"use client";

import ConfirmModal from "@/lib/components/ConfirmModal";
import { Pantalon, Saco } from "@/lib/domain/reservas/types";
import { useConfirmDestructive } from "@/lib/hooks/useConfirmDestructive";
import { ACTION_BUTTON_BASE_CLASS, ACTION_BUTTON_CLASSES, TABLE_HEADER_CLASS } from "@/lib/utils/uiStyles";
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
  useDisclosure,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Prenda = Saco | Pantalon;

type PrendaCrudPageProps<T extends Prenda> = {
  title: string;
  /** Singular para el mensaje de confirmación, ej. "saco", "pantalón". */
  entitySingular?: string;
  listFn: () => Promise<T[]>;
  createFn: (payload: any) => Promise<T>;
  updateFn: (id: number, payload: any) => Promise<T>;
  deleteFn: (id: number) => Promise<{ message: string }>;
};

type PrendaForm = {
  codigo: string;
  marca: string;
  talle: string;
  color: string;
  condicion: Saco["condicion"];
};

const INITIAL_FORM: PrendaForm = {
  codigo: "",
  marca: "",
  talle: "",
  color: "",
  condicion: "LIMPIA",
};

type PrendaColumnKey =
  | "codigo"
  | "marca"
  | "talle"
  | "color"
  | "condicion"
  | "acciones";

export function PrendaCrudPage<T extends Prenda>({
  title,
  entitySingular = "registro",
  listFn,
  createFn,
  updateFn,
  deleteFn,
}: PrendaCrudPageProps<T>) {
  const { confirmModalRef, confirmDestructive } = useConfirmDestructive();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [rows, setRows] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [form, setForm] = useState<PrendaForm>(INITIAL_FORM);

  const isEdit = Boolean(editingRow);

  const refresh = async () => {
    try {
      setIsLoading(true);
      setRows(await listFn());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `No se pudo cargar ${title}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      [row.codigo, row.marca, row.talle, row.color]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [rows, search]);

  const columns = useMemo<{ key: PrendaColumnKey; label: string }[]>(() => {
    return [
      { key: "codigo", label: "Codigo" },
      { key: "marca", label: "Marca" },
      { key: "talle", label: "Talle" },
      { key: "color", label: "Color" },
      { key: "condicion", label: "Condicion" },
      { key: "acciones", label: "Acciones" },
    ];
  }, []);

  const renderCell = (item: T, columnKey: PrendaColumnKey) => {
    switch (columnKey) {
      case "codigo":
        return item.codigo;
      case "marca":
        return item.marca;
      case "talle":
        return item.talle ?? "-";
      case "color":
        return item.color ?? "-";
      case "condicion":
        return item.condicion;
      case "acciones":
        return (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className={`${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.edit}`}
              onPress={() => openEdit(item)}
            >
              Editar
            </Button>
            <Button
              size="sm"
              className={`${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.delete}`}
              onPress={() => handleDeleteRequest(item)}
            >
              Eliminar
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const resetForm = () => {
    setEditingRow(null);
    setForm(INITIAL_FORM);
  };

  const openCreate = () => {
    resetForm();
    onOpen();
  };

  const openEdit = (row: T) => {
    setEditingRow(row);
    setForm({
      codigo: row.codigo ?? "",
      marca: row.marca ?? "",
      talle: row.talle ?? "",
      color: row.color ?? "",
      condicion: row.condicion,
    });
    onOpen();
  };

  const handleSubmit = async () => {
    if (!form.codigo.trim() || !form.marca.trim()) {
      toast.error("Codigo y marca son obligatorios");
      return;
    }

    const payload: any = {
      codigo: form.codigo.trim(),
      marca: form.marca.trim(),
      talle: form.talle.trim() || undefined,
      color: form.color.trim() || undefined,
      condicion: form.condicion,
    };

    try {
      setIsSubmitting(true);
      if (editingRow) {
        await updateFn(editingRow.id, payload);
        toast.success("Registro actualizado");
      } else {
        await createFn(payload);
        toast.success("Registro creado");
      }
      await refresh();
      onOpenChange();
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = (item: T) => {
    void confirmDestructive({
      title: `Eliminar ${entitySingular}`,
      message: `¿Seguro que querés eliminar este ${entitySingular} (${item.codigo})?`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      action: async () => {
        try {
          await deleteFn(item.id);
          toast.success("Registro desactivado");
          await refresh();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "No se pudo eliminar");
          throw error;
        }
      },
    });
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <ConfirmModal ref={confirmModalRef} />

      <div className="rounded-lg border border-pastel-border bg-pastel-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-pastel-text">{title}</h1>
          <Button
            className={`${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.success}`}
            onPress={openCreate}
          >
            Nuevo
          </Button>
        </div>
        <Input
          className="mt-3 max-w-md"
          label={`Buscar ${title.toLowerCase()}`}
          placeholder="Codigo, marca, talle o color"
          value={search}
          onValueChange={setSearch}
        />
      </div>

      {isLoading ? (
        <div className="flex h-28 items-center justify-center">
          <Spinner color="secondary" />
        </div>
      ) : (
        <Table aria-label={`Listado de ${title}`}>
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn key={column.key} className={TABLE_HEADER_CLASS}>
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={filtered}
            emptyContent={`No hay ${title.toLowerCase()} disponibles`}
          >
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey as PrendaColumnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={resetForm}>
        <ModalContent>
          <>
            <ModalHeader>{isEdit ? "Editar" : "Nuevo"} registro</ModalHeader>
            <ModalBody>
              <Input
                isRequired
                label="Codigo"
                value={form.codigo}
                onValueChange={(value) => setForm((prev) => ({ ...prev, codigo: value }))}
              />
              <Input
                isRequired
                label="Marca"
                value={form.marca}
                onValueChange={(value) => setForm((prev) => ({ ...prev, marca: value }))}
              />
              <Input
                label="Talle"
                value={form.talle}
                onValueChange={(value) => setForm((prev) => ({ ...prev, talle: value }))}
              />
              <Input
                label="Color"
                value={form.color}
                onValueChange={(value) => setForm((prev) => ({ ...prev, color: value }))}
              />
              <Select 
                label="Condicion"
                selectedKeys={[form.condicion]}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0];
                  if (!key) return;
                  setForm((prev) => ({
                    ...prev,
                    condicion: key as PrendaForm["condicion"],
                  }));
                }}
              >
                <SelectItem key="LIMPIA">LIMPIA</SelectItem>
                <SelectItem key="SUCIA">SUCIA</SelectItem>
                <SelectItem key="REQUIERE_REVISION">REQUIERE_REVISION</SelectItem>
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onOpenChange}>
                Cancelar
              </Button>
              <Button color="primary" onPress={handleSubmit} isLoading={isSubmitting}>
                Guardar
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </div>
  );
}
