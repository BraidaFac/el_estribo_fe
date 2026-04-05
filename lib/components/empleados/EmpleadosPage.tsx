"use client";

import ConfirmModal from "@/lib/components/ConfirmModal";
import type {
  CreateUsuarioPayload,
  UpdateUsuarioPayload,
  UserRole,
  UsuarioItem,
} from "@/lib/domain/usuarios/types";
import { useConfirmDestructive } from "@/lib/hooks/useConfirmDestructive";
import {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  listarUsuarios,
} from "@/lib/services/v2/usuarios-v2.service";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import { TABLE_HEADER_CLASS } from "@/lib/utils/uiStyles";
import {
  Button,
  Chip,
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

type EmpleadoForm = {
  name: string;
  userName: string;
  password: string;
  role: UserRole;
};

type ModalMode = { mode: "create" } | { mode: "edit"; usuario: UsuarioItem };

const EMPTY_FORM: EmpleadoForm = {
  name: "",
  userName: "",
  password: "",
  role: "USER",
};

export function EmpleadosPage() {
  const { confirmModalRef, confirmDestructive } = useConfirmDestructive();
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [form, setForm] = useState<EmpleadoForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      setUsuarios(await listarUsuarios());
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

  const abrirEditar = (usuario: UsuarioItem) => {
    setForm({
      name: usuario.name,
      userName: usuario.userName,
      password: "",
      role: usuario.role,
    });
    setModalMode({ mode: "edit", usuario });
  };

  const cerrarModal = () => setModalMode(null);

  const handleGuardar = async () => {
    if (!form.name.trim() || !form.userName.trim()) {
      toast.error("Nombre y usuario son obligatorios");
      return;
    }
    if (modalMode?.mode === "create" && !form.password.trim()) {
      toast.error("La contraseña es obligatoria al crear un empleado");
      return;
    }

    try {
      setSaving(true);
      if (modalMode?.mode === "create") {
        const payload: CreateUsuarioPayload = {
          name: form.name.trim(),
          userName: form.userName.trim(),
          password: form.password,
          role: form.role,
        };
        await crearUsuario(payload);
        toast.success("Empleado creado");
      } else if (modalMode?.mode === "edit") {
        const payload: UpdateUsuarioPayload = {
          name: form.name.trim(),
          userName: form.userName.trim(),
          role: form.role,
        };
        if (form.password.trim()) payload.password = form.password.trim();
        await actualizarUsuario(modalMode.usuario.id, payload);
        toast.success("Empleado actualizado");
      }
      cerrarModal();
      await cargar();
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = (usuario: UsuarioItem) => {
    void confirmDestructive({
      title: "Eliminar empleado",
      message: `¿Eliminar a ${usuario.name} (${usuario.userName})? Esta acción no se puede deshacer desde la aplicación.`,
      confirmText: "Eliminar",
      variant: "danger",
      action: async () => {
        await eliminarUsuario(usuario.id);
        toast.success("Empleado eliminado");
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
          {(onClose) => (
            <>
              <ModalHeader>
                {modalMode?.mode === "create"
                  ? "Nuevo empleado"
                  : "Editar empleado"}
              </ModalHeader>
              <ModalBody className="gap-3">
                <Input
                  label="Nombre completo"
                  isRequired
                  value={form.name}
                  onValueChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  autoComplete="off"
                />
                <Input
                  label="Usuario"
                  isRequired
                  value={form.userName}
                  onValueChange={(v) => setForm((f) => ({ ...f, userName: v }))}
                  autoComplete="off"
                />
                <Input
                  label={
                    modalMode?.mode === "edit"
                      ? "Nueva contraseña (dejar vacío para no cambiar)"
                      : "Contraseña"
                  }
                  type="password"
                  isRequired={modalMode?.mode === "create"}
                  value={form.password}
                  onValueChange={(v) => setForm((f) => ({ ...f, password: v }))}
                  autoComplete="new-password"
                />
                <Select
                  label="Rol"
                  selectedKeys={[form.role]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as UserRole;
                    if (selected) setForm((f) => ({ ...f, role: selected }));
                  }}
                >
                  <SelectItem key="USER">Empleado (USER)</SelectItem>
                  <SelectItem key="ADMIN">Administrador (ADMIN)</SelectItem>
                </Select>
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
          )}
        </ModalContent>
      </Modal>

      <div className="rounded-lg border border-pastel-border bg-pastel-surface p-4">
        <h1 className="text-2xl font-semibold text-pastel-text">Empleados</h1>
        <Button size="sm" color="primary" className="mt-3" onPress={abrirCrear}>
          Nuevo empleado
        </Button>
      </div>

      {loading ? (
        <div className="flex h-28 items-center justify-center">
          <Spinner color="secondary" />
        </div>
      ) : (
        <Table aria-label="Empleados">
          <TableHeader>
            <TableColumn className={TABLE_HEADER_CLASS}>Nombre</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Usuario</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Rol</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Acciones</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No hay empleados registrados.">
            {usuarios.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell className="text-pastel-text/70">
                  {u.userName}
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    color={u.role === "ADMIN" ? "warning" : "default"}
                    variant="flat"
                  >
                    {u.role === "ADMIN" ? "Admin" : "Empleado"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => abrirEditar(u)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      onPress={() => handleEliminar(u)}
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
    </div>
  );
}
