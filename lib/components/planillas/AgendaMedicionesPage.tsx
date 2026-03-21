"use client";

import ConfirmModal from "@/lib/components/ConfirmModal";
import { MedicionesReservaModal } from "@/lib/components/medidas/MedicionesReservaModal";
import { ApiDateField } from "@/lib/components/ui/ApiDateField";
import { getEstadoAgendaMedicionLabel } from "@/lib/domain/reservas/labels";
import { AgendaMedicion, EstadoAgendaMedicion } from "@/lib/domain/reservas/types";
import { useConfirmDestructive } from "@/lib/hooks/useConfirmDestructive";
import {
    actualizarEstadoAgendaMedicion,
    listarAgendaMediciones,
} from "@/lib/services/v2";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import { formatApiDateTimeForUi } from "@/lib/utils/formatApiDate";
import { TABLE_HEADER_CLASS } from "@/lib/utils/uiStyles";
import {
    Button,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from "@heroui/react";
import { addMonths, format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function agendaPermiteCambioEstado(estado: EstadoAgendaMedicion): boolean {
  return estado === "PROGRAMADA" || estado === "REPROGRAMADA";
}

function normalizePhoneForWhatsapp(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return null;
  return digits.startsWith("54") ? digits : `54${digits}`;
}

function WhatsappIconButton({ telefono }: { telefono: string | null | undefined }) {
  const n = normalizePhoneForWhatsapp(telefono);
  if (!n) return null;
  return (
    <a
      href={`https://wa.me/${n}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex shrink-0 rounded-md p-1 text-[#25D366] hover:bg-emerald-50"
      aria-label="Abrir WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={22}
        height={22}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    </a>
  );
}

/** Citas operativas: programadas, reprogramadas y no asistió (sin asistió ni canceladas). */
async function cargarVistaOperativa() {
  return listarAgendaMediciones({
    incluirTodosLosEstados: false,
  });
}

export function AgendaMedicionesPage() {
  const { confirmModalRef, confirmDestructive } = useConfirmDestructive();
  const hoy = format(new Date(), "yyyy-MM-dd");
  const unMesAdelante = format(addMonths(new Date(), 1), "yyyy-MM-dd");

  const [filtroDesde, setFiltroDesde] = useState(hoy);
  const [filtroHasta, setFiltroHasta] = useState(unMesAdelante);
  const [rows, setRows] = useState<AgendaMedicion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  /** Qué criterio usó el último listado exitoso (para refrescar tras cambiar estado). */
  const [modoListado, setModoListado] = useState<"operativa" | "rangoCompleto">(
    "operativa",
  );
  const [medicionesCtx, setMedicionesCtx] = useState<{
    reservaId: number;
    tienePantalon: boolean;
  } | null>(null);

  const loadOperativa = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await cargarVistaOperativa();
      setRows(data);
      setModoListado("operativa");
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const aplicarFiltroTodasLasCitas = async () => {
    try {
      setIsLoading(true);
      const data = await listarAgendaMediciones({
        desde: filtroDesde,
        hasta: filtroHasta,
        incluirTodosLosEstados: true,
      });
      setRows(data);
      setModoListado("rangoCompleto");
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  /** Restaura fechas por defecto y la misma lista que al abrir la pantalla (vista operativa, sin rango). */
  const limpiarFiltro = async () => {
    const desde = format(new Date(), "yyyy-MM-dd");
    const hasta = format(addMonths(new Date(), 1), "yyyy-MM-dd");
    setFiltroDesde(desde);
    setFiltroHasta(hasta);
    await loadOperativa();
  };

  useEffect(() => {
    void loadOperativa();
  }, [loadOperativa]);

  const refrescar = async () => {
    try {
      setIsLoading(true);
      if (modoListado === "rangoCompleto") {
        const data = await listarAgendaMediciones({
          desde: filtroDesde,
          hasta: filtroHasta,
          incluirTodosLosEstados: true,
        });
        setRows(data);
      } else {
        const data = await cargarVistaOperativa();
        setRows(data);
      }
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const solicitarCambioEstado = (
    row: AgendaMedicion,
    estado: EstadoAgendaMedicion,
    dialog: { title: string; message: string; confirmText: string },
  ) => {
    void confirmDestructive({
      title: dialog.title,
      message: dialog.message,
      confirmText: dialog.confirmText,
      cancelText: "Cancelar",
      action: async () => {
        try {
          setUpdatingId(row.id);
          await actualizarEstadoAgendaMedicion(row.id, estado);
          toast.success("Estado de la cita actualizado");
          await refrescar();
        } catch (error) {
          toast.error(getUserFacingErrorMessage(error));
          throw error;
        } finally {
          setUpdatingId(null);
        }
      },
    });
  };

  /**
   * Fase 4: primero PATCH agenda → ASISTIO, luego el usuario guarda medidas con PUT.
   * Tras marcar asistió, la fila sale de la vista operativa; refrescamos y abrimos el modal.
   */
  const abrirMedicionesAsistencia = async (row: AgendaMedicion) => {
    try {
      setUpdatingId(row.id);
      await actualizarEstadoAgendaMedicion(row.id, "ASISTIO");
      toast.success(
        "Asistió registrado en la agenda. Ingresá las medidas y guardá para completar contacto y tareas vinculadas.",
      );
      await refrescar();
      setMedicionesCtx({
        reservaId: row.reserva.id,
        tienePantalon: row.reserva.pantalon != null,
      });
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      <ConfirmModal ref={confirmModalRef} />

      <div className="rounded-lg border border-pastel-border bg-pastel-surface p-4">
        <h1 className="text-2xl font-semibold text-pastel-text">Agenda de mediciones</h1>
        <p className="mt-1 text-sm text-pastel-text/80">
          Al ingresar se muestran las citas <strong>programadas</strong>, <strong>reprogramadas</strong> y{" "}
          <strong>no asistió</strong> (se ocultan asistió y canceladas). Usá el filtro para ver{" "}
          <strong>todos los estados</strong> en un rango de fechas (por defecto desde hoy hasta un mes).{" "}
          <strong>Asistió (medidas)</strong> primero marca la cita como asistió en la agenda (la fila puede
          desaparecer de esta vista) y abre el registro de medidas; al guardar medidas se completan las
          tareas operativas vinculadas.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <ApiDateField label="Desde" value={filtroDesde} onChange={setFiltroDesde} />
          <ApiDateField label="Hasta" value={filtroHasta} onChange={setFiltroHasta} />
          <div className="flex flex-wrap items-end gap-2 xl:col-span-2">
            <Button color="primary" onPress={aplicarFiltroTodasLasCitas} isDisabled={isLoading}>
              Filtrar todas las citas
            </Button>
            <Button variant="bordered" onPress={limpiarFiltro} isDisabled={isLoading}>
              Limpiar filtro
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-24 items-center justify-center">
          <Spinner color="secondary" />
        </div>
      ) : (
        <Table aria-label="Agenda de mediciones">
          <TableHeader>
            <TableColumn className={TABLE_HEADER_CLASS}>Cita</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Reserva</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Cliente</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Teléfono</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Estado</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Observaciones</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Acciones</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={
              modoListado === "operativa"
                ? "Sin citas activas para mostrar"
                : "Sin citas en el rango y criterios elegidos"
            }
          >
            {rows.map((row) => {
              const puedeEditar = agendaPermiteCambioEstado(row.estado);
              const busy = updatingId === row.id;
              const tel = row.clienteTelefonoSnapshot?.trim() || null;
              return (
                <TableRow key={row.id}>
                  <TableCell>{formatApiDateTimeForUi(row.fechaHoraCita)}</TableCell>
                  <TableCell>#{row.reserva.id}</TableCell>
                  <TableCell>{row.clienteNombreSnapshot}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="min-w-0 break-all">{tel ?? "—"}</span>
                      {tel ? <WhatsappIconButton telefono={tel} /> : null}
                    </div>
                  </TableCell>
                  <TableCell>{getEstadoAgendaMedicionLabel(row.estado)}</TableCell>
                  <TableCell>{row.observaciones ?? "-"}</TableCell>
                  <TableCell>
                    {puedeEditar ? (
                      <div className="flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          color="success"
                          variant="flat"
                          className="min-w-0 px-2"
                          isDisabled={busy}
                          isLoading={busy}
                          onPress={() => void abrirMedicionesAsistencia(row)}
                        >
                          Asistió (medidas)
                        </Button>
                        <Button
                          size="sm"
                          color="warning"
                          variant="flat"
                          className="min-w-0 px-2"
                          isDisabled={busy}
                          isLoading={busy}
                          onPress={() =>
                            solicitarCambioEstado(row, "NO_ASISTIO", {
                              title: "Registrar inasistencia",
                              message: `¿Seguro que querés marcar como no asistió la cita de la reserva #${row.reserva.id} (${formatApiDateTimeForUi(row.fechaHoraCita)})?`,
                              confirmText: "Sí, no asistió",
                            })
                          }
                        >
                          No asistió
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          className="min-w-0 px-2"
                          isDisabled={busy}
                          isLoading={busy}
                          onPress={() =>
                            solicitarCambioEstado(row, "CANCELADA", {
                              title: "Cancelar cita",
                              message: `¿Seguro que querés cancelar esta cita de medición? (Reserva #${row.reserva.id}, ${formatApiDateTimeForUi(row.fechaHoraCita)})`,
                              confirmText: "Sí, cancelar cita",
                            })
                          }
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-pastel-text/60">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <MedicionesReservaModal
        isOpen={medicionesCtx != null}
        onOpenChange={(open) => {
          if (!open) setMedicionesCtx(null);
        }}
        reservaId={medicionesCtx?.reservaId ?? null}
        tienePantalon={medicionesCtx?.tienePantalon ?? false}
        onGuardado={async () => {
          await refrescar();
        }}
      />
    </div>
  );
}
