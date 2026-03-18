"use client";
import { useAppContext } from "@/lib/components/AppContext";
import ConfirmationModal, {
  ConfirmModalRef,
} from "@/lib/components/ConfirmModal";
import { getState, Suit, SuitState } from "@/lib/utils/suit";
import {
  ACTION_BUTTON_BASE_CLASS,
  ACTION_BUTTON_CLASSES,
  ACTION_POSITION,
  TABLE_HEADER_CLASS,
  TABLE_TITLE_CLASS,
  TABLE_WRAPPER_CLASS
} from "@/lib/utils/uiStyles";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
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
  useDisclosure
} from "@heroui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useSuits } from "./hooks/useSuits";
import { SuitFormData, suitSchema } from "./suit.schema";

export default function SuitsPage() {
  const { fetchSuits, deleteSuit, createSuit, updateSuit } = useSuits();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const confirmDeleteModalRef = useRef<ConfirmModalRef>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSuit, setSelectedSuit] = useState<Suit | null>(null);
  const { isLoading, error, suits } = useAppContext();
  // Hook para obtener la lista de trajes

  // Hook para manejar el formulario de trajes
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SuitFormData>({
    resolver: yupResolver(suitSchema),
  });

  const EMPTY_SUIT_FORM: Partial<SuitFormData> = {
    id: "",
    color: "",
    category: "",
    brand: "",
    state: "",
    size: undefined,
  };

  const resetValues = () => {
    reset(EMPTY_SUIT_FORM);
    setIsEditing(false);
    setSelectedSuit(null);
    onClose();
  };

  // Lógica para manejar la creación de un traje
  const onSubmit = async (data: SuitFormData) => {
    const payload: Partial<Suit> = {
      ...data,
      state: data?.state || SuitState.ENLOCALLIMPIO,
    };
    isEditing
      ? await updateSuit(payload)
      : await createSuit(payload);
    resetValues();
  };

  // Lógica para eliminar un traje
  const handleDelete = async (suitId: string) => {
    const confirmed = await confirmDeleteModalRef.current?.openModal();
    if (!confirmed) return;

    await deleteSuit(suitId);
    resetValues();
  };

  //Logica para actualizar
  const handleEdit = (suit: Suit) => {
    setSelectedSuit(suit);
    setIsEditing(true);
    onOpen();
  };
  // Resetear el formulario cuando se cierra el modal
  const handleClose = () => {
    resetValues();
  };
 
  // Configuración de columnas para la tabla de trajes
  const columns = [
    { label: "Codigo", key: "id" },
    { label: "Color", key: "color" },
    { label: "Categoria", key: "category" },
    { label: "Marca", key: "brand" },
    { label: "Talle", key: "size" },
    { label: "Estado", key: "state" },
    { label: "Acciones", key: "actions" },
  ];

  useEffect(() => {
    if (selectedSuit) {
      reset(selectedSuit);
    }
  }, [selectedSuit, reset]);

  useEffect(() => {
    fetchSuits();
  }, [fetchSuits]);
 
  if (error) {
    return (
      <div className="absolute right-1/2 top-1/2">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return <Spinner className="absolute right-1/2 top-1/2" color="danger" />;
  }

  return (
    <>
      <ConfirmationModal
        ref={confirmDeleteModalRef}
        title="Eliminar traje"
        message="Esta acción no se puede deshacer. ¿Querés continuar?"
        variant="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
        className="w-11/12"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isEditing ? "Modificar traje" : "Nuevo traje"}
              </ModalHeader>
              <ModalBody>
                <form
                  className="flex flex-col gap-2"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <Input
                    {...register("id")}
                    disabled={isEditing}
                    label="Codigo"
                    placeholder="Codigo"
                  />
                  <Input
                    {...register("color")}
                    label="Color"
                    startContent={true}
                    placeholder="Color"
                  />
                  {errors.color && (
                    <span className="text-red-600 text-xs">
                      {errors.color.message}
                    </span>
                  )}
                  <Input
                    {...register("brand")}
                    label="Marca"
                    placeholder="Marca"
                  />
                  {errors.brand && (
                    <span className="text-red-600 text-xs">
                      {errors.brand.message}
                    </span>
                  )}
                  <Input
                    {...register("size", { valueAsNumber: true })}
                    label="Talle"
                    placeholder="Talle"
                    type="number"
                  />
                  {errors.size && (
                    <span className="text-red-600 text-xs">
                      {errors.size.message}
                    </span>
                  )}

                  <Select {...register("category")} label="Categoría">
                    <SelectItem key="A">A</SelectItem>
                    <SelectItem key="B">B</SelectItem>
                    <SelectItem key="C">C</SelectItem>
                  </Select>
                  {errors.category && (
                    <span className="text-red-600 text-xs">
                      {errors.category.message}
                    </span>
                  )}
                  {/* {isEditing && (
                    <>
                      <Select {...register("state")} label="Estado del traje">
                        <SelectItem
                          key={SuitState.ENLOCALLIMPIO}
                          value={SuitState.ENLOCALLIMPIO}
                        >
                          EN LOCAL LIMPIO
                        </SelectItem>
                        <SelectItem
                          key={SuitState.ENLOCALSUCIO}
                          value={SuitState.ENLOCALSUCIO}
                        >
                          EN LOCAL SUCIO
                        </SelectItem>
                        <SelectItem
                          key={SuitState.RETIRADO}
                          value={SuitState.RETIRADO}
                        >
                          RETIRADO
                        </SelectItem>
                        <SelectItem
                          key={SuitState.LAVANDERIALIMPIO}
                          value={SuitState.LAVANDERIALIMPIO}
                        >
                          EN LAVANDERIA LIMPIO
                        </SelectItem>
                        <SelectItem
                          key={SuitState.LAVANDERIASUCIO}
                          value={SuitState.LAVANDERIASUCIO}
                        >
                          EN LAVANDERIA SUCIO
                        </SelectItem>
                        <SelectItem
                          key={SuitState.MODISTA}
                          value={SuitState.MODISTA}
                        >
                          MODISTA
                        </SelectItem>
                      </Select>
                      {errors.category && (
                        <span className="text-red-600 text-xs">
                          {errors.state?.message}
                        </span>
                      )}
                    </>
                  )} */}
                  <Button
                    className={`mt-4 ${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.save}`}
                    type="submit"
                  >
                    Guardar
                  </Button>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Tabla de trajes */}

      <div className="w-full mx-auto mt-5">
        <h2 className={`${TABLE_TITLE_CLASS} mb-3 ${ACTION_POSITION.left}`}>Trajes</h2>
        <Button
          onPress={onOpen}
          className={`mb-2 ${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.success} ${ACTION_POSITION.right}`}
        >
          Nuevo
        </Button>
        <Table aria-label="Tabla de trajes" className={TABLE_WRAPPER_CLASS}>
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn className={TABLE_HEADER_CLASS} key={column.key}>
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={suits || []}>
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.color}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.brand}</TableCell>
                <TableCell>{item.size}</TableCell>
                <TableCell>{getState(item.state as SuitState)}</TableCell>
                <TableCell>
                  <div className="flex flex-row gap-3">
                    <Button
                      size="sm"
                      className={`${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.edit}`}
                      onPress={() => {
                        handleEdit(item);
                      }}
                    >
                      Modificar
                    </Button>
                    <Button
                      size="sm"
                      className={`${ACTION_BUTTON_BASE_CLASS} ${ACTION_BUTTON_CLASSES.delete}`}
                      onPress={async () => await handleDelete(item.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
