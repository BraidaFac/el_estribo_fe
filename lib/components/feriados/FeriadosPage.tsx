"use client";

import ConfirmModal from "@/lib/components/ConfirmModal";
import { useConfirmDestructive } from "@/lib/hooks/useConfirmDestructive";
import type { FeriadoV2 } from "@/lib/services/v2/feriados-v2.service";
import {
  actualizarFeriado,
  crearFeriado,
  eliminarFeriado,
  listarFeriados,
} from "@/lib/services/v2/feriados-v2.service";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import {
  ACTION_BUTTON_BASE_CLASS,
  ACTION_BUTTON_CLASSES,
  TABLE_HEADER_CLASS,
} from "@/lib/utils/uiStyles";
import {
  Button,
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

type FormState = {
  fecha: string;
  motivo: string;
};

const EMPTY_FORM: FormState = {
  fecha: "",
  motivo: "",
};

function origenLabel(o: FeriadoV2["origen"]): string {
  return o === "API" ? "Oficial (API)" : "Manual";
}

export function FeriadosPage() {
  const { confirmModalRef, confirmDestructive } = useConfirmDestructive();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [rows, setRows] = useState<FeriadoV2[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRow, setEditingRow] = useState<FeriadoV2 | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [filtroAno, setFiltroAno] = useState<string>("");

  const anoParsed = useMemo(() => {
    const t = filtroAno.trim();
    if (!t) return undefined;
    const n = Number(t);
    if (!Number.isInteger(n) || n < 2000 || n > 2100) return undefined;
    return n;
  }, [filtroAno]);

  const isEdit = Boolean(editingRow);
  const submitDisabled = !form.fecha || !form.motivo.trim() || isSubmitting;

  const refresh = async () => {
    setIsLoading(true);
    try {
      if (filtroAno.trim() !== "" && anoParsed === undefined) {
        setRows([]);
        return;
      }
      const data = await listarFeriados(anoParsed);
      setRows(data);
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anoParsed, filtroAno]);

  const resetForm = () => {
    setEditingRow(null);
    setForm(EMPTY_FORM);
  };

  const handleOpenCreate = () => {
    resetForm();
    onOpen();
  };

  const handleOpenEdit = (row: FeriadoV2) => {
    setEditingRow(row);
    setForm({
      fecha: row.fecha.slice(0, 10),
      motivo: row.motivo ?? "",
    });
    onOpen();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        fecha: form.fecha,
        motivo: form.motivo.trim(),
      };

      if (editingRow) {
        await actualizarFeriado(editingRow.id, payload);
        toast.success("Feriado actualizado");
      } else {
        await crearFeriado(payload);
        toast.success("Feriado creado");
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

  const handleDeleteRequest = (row: FeriadoV2) => {
    void confirmDestructive({
      title: "Eliminar feriado",
      message: `¿Seguro que querés eliminar el feriado del ${row.fecha.slice(0, 10)}?`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      action: async () => {
        try {
          await eliminarFeriado(row.id);
          toast.success("Feriado eliminado");
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
      <ConfirmModal ref={confirmModalRef} />

      <div className="flex flex-col gap-3 rounded-lg border border-pastel-border bg-pastel-surface p-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-pastel-text">Feriados</h1>
        <div className="flex flex-wrap items-end gap-3">
          <Input
            className="max-w-[140px]"
            label="Filtrar por año"
            placeholder="Ej. 2026"
            value={filtroAno}
            onValueChange={setFiltroAno}
            description="Vacío = todos los años"
            size="sm"
          />
          <Button
            className={`${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.success}`}
            onPress={handleOpenCreate}
          >
            Nuevo feriado
          </Button>
        </div>
      </div>

      <p className="text-sm text-pastel-text/80">
        Los feriados oficiales del año actual se cargan solos al iniciar el backend si aún no hay
        ningún registro de ese año. Podés sumar feriados internos o ajustar los existentes.
      </p>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Spinner color="secondary" />
        </div>
      ) : (
        <Table aria-label="Feriados">
          <TableHeader>
            <TableColumn className={TABLE_HEADER_CLASS}>Fecha</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Motivo</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Origen</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Tipo (API)</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Acciones</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay feriados para mostrar">
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.fecha.slice(0, 10)}</TableCell>
                <TableCell>{row.motivo ?? "-"}</TableCell>
                <TableCell>{origenLabel(row.origen)}</TableCell>
                <TableCell>{row.tipo ?? "-"}</TableCell>
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
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={resetForm}>
        <ModalContent>
          <>
            <ModalHeader>{isEdit ? "Editar feriado" : "Nuevo feriado"}</ModalHeader>
            <ModalBody>
              <Input
                type="date"
                label="Fecha"
                value={form.fecha}
                onValueChange={(value) => setForm((prev) => ({ ...prev, fecha: value }))}
              />
              <Input
                isRequired
                label="Motivo"
                value={form.motivo}
                onValueChange={(value) => setForm((prev) => ({ ...prev, motivo: value }))}
              />
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
