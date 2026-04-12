"use client";

import ConfirmModal from "@/lib/components/ConfirmModal";
import { AccesoriosRetiroModal } from "@/lib/components/accesorios/AccesoriosRetiroModal";
import { MedicionesReservaModal } from "@/lib/components/medidas/MedicionesReservaModal";
import { EnvioLavanderiaReservaModal } from "@/lib/components/planillas/EnvioLavanderiaReservaModal";
import { EnvioModistaReservaModal } from "@/lib/components/planillas/EnvioModistaReservaModal";
import { RecibirModistaModal } from "@/lib/components/planillas/RecibirModistaModal";
import { DevolucionRecepcionModal } from "@/lib/components/reservas/DevolucionRecepcionModal";
import { RecordatorioRetiroModal } from "@/lib/components/planillas/RecordatorioRetiroModal";
import { ApiDateField } from "@/lib/components/ui/ApiDateField";
import {
  resumenLavanderiasReservaDetalle,
  resumenModistasReservaDetalle,
} from "@/lib/domain/reservas/asignacionesServicio";
import {
  getEstadoUbicacionPrendaLabel,
  getPrioridadTareaOperativaLabel,
} from "@/lib/domain/reservas/labels";
import {
  prendasEnTiendaParaRetiroCliente,
  reservaTieneTareasOperativasAbiertas,
  tareaConPrendaEnTienda,
} from "@/lib/domain/reservas/retiroCliente";
import type { AccesorioItem } from "@/lib/domain/accesorios/types";
import { Reserva, TareaOperativa } from "@/lib/domain/reservas/types";
import { useConfirmDestructive } from "@/lib/hooks/useConfirmDestructive";
import {
  PLANILLA_OPERACIONES_UI,
  type PlanillaOperacionesMode,
} from "@/lib/planillas/planillaOperacionesConfig";
import {
  listarAccesorios,
  setExtrasReserva,
} from "@/lib/services/v2/accesorios-v2.service";
import {
  listarReservasRango,
  listarTareasOperativas,
  marcarReservaRetirada,
} from "@/lib/services/v2";
import {
  marcarRecibidoModista,
  registrarRecibirLavanderiaPorReserva,
  registrarRecibirModistaPorReserva,
} from "@/lib/services/v2/tareas-operativas-v2.service";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import { formatApiDateForUi } from "@/lib/utils/formatApiDate";
import { TABLE_HEADER_CLASS } from "@/lib/utils/uiStyles";
import {
  Button,
  Chip,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";
import Link from "next/link";
import { addMonths, format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type PlanillaOperacionesPageProps = {
  mode: PlanillaOperacionesMode;
};

type GrupoTareasReserva = {
  reservaId: number;
  clienteNombre: string | null;
  tareas: TareaOperativa[];
};

function groupTareasPorReserva(tareas: TareaOperativa[]): GrupoTareasReserva[] {
  const map = new Map<number, TareaOperativa[]>();
  for (const t of tareas) {
    const rid = t.reserva?.id;
    if (rid == null) continue;
    if (!map.has(rid)) map.set(rid, []);
    map.get(rid)!.push(t);
  }
  return Array.from(map.entries())
    .map(([reservaId, ts]) => ({
      reservaId,
      clienteNombre: ts[0]?.clienteNombre ?? null,
      tareas: ts.sort((a, b) => a.id - b.id),
    }))
    .sort((a, b) => a.reservaId - b.reservaId);
}

function defaultDesdeHasta() {
  const hoy = new Date();
  return {
    desde: format(hoy, "yyyy-MM-dd"),
    hasta: format(addMonths(hoy, 1), "yyyy-MM-dd"),
  };
}

export function PlanillaOperacionesPage({
  mode,
}: PlanillaOperacionesPageProps) {
  const ui = PLANILLA_OPERACIONES_UI[mode];
  const { confirmModalRef, confirmDestructive } = useConfirmDestructive();
  const [desde, setDesde] = useState(() => defaultDesdeHasta().desde);
  const [hasta, setHasta] = useState(() => defaultDesdeHasta().hasta);
  const [isLoading, setIsLoading] = useState(false);
  const [tareas, setTareas] = useState<TareaOperativa[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);

  /** Tareas operativas (filtradas por reservas visibles) para advertencias en retiro de cliente. */
  const [tareasRetiroContexto, setTareasRetiroContexto] = useState<
    TareaOperativa[]
  >([]);
  const [lavModalReservaId, setLavModalReservaId] = useState<number | null>(
    null,
  );
  const [lavModalPantalon, setLavModalPantalon] = useState(false);
  const [modModalReservaId, setModModalReservaId] = useState<number | null>(
    null,
  );
  const [modModalPantalon, setModModalPantalon] = useState(false);
  const [medModalReservaId, setMedModalReservaId] = useState<number | null>(
    null,
  );
  const [medModalPantalon, setMedModalPantalon] = useState(false);
  const [devolucionModalReserva, setDevolucionModalReserva] =
    useState<Reserva | null>(null);
  const [retiroAccesoriosReserva, setRetiroAccesoriosReserva] =
    useState<Reserva | null>(null);
  const [accesorios, setAccesorios] = useState<AccesorioItem[]>([]);
  const [loadingAccesorios, setLoadingAccesorios] = useState(false);
  const [retiroConfirming, setRetiroConfirming] = useState(false);
  const [recordatorioOpen, setRecordatorioOpen] = useState(false);
  const [retiroPendingReserva, setRetiroPendingReserva] = useState<Reserva | null>(null);
  const [recibirModistaOpen, setRecibirModistaOpen] = useState(false);
  const [recibirModistaLoading, setRecibirModistaLoading] = useState(false);
  const [recibirModistaGrupo, setRecibirModistaGrupo] = useState<GrupoTareasReserva | null>(null);
  const [recibirModistaTareaId, setRecibirModistaTareaId] = useState<number | null>(null);

  const canSearch = !!desde && !!hasta;

  const visibleTareas = useMemo(() => {
    if (mode === "LLEVAR_LAVANDERIA" || mode === "RETIRAR_LAVANDERIA") {
      return tareas.filter(
        (t) =>
          t.tipoTarea === "LLEVAR_LAVANDERIA" &&
          (mode === "LLEVAR_LAVANDERIA"
            ? t.estado === "PENDIENTE"
            : t.estado === "EN_PROCESO"),
      );
    }
    if (mode === "LLEVAR_MODISTA") {
      return tareas.filter(
        (t) => t.tipoTarea === "LLEVAR_MODISTA" && t.estado === "PENDIENTE",
      );
    }
    if (mode === "RETIRAR_MODISTA") {
      return tareas.filter(
        (t) => t.tipoTarea === "LLEVAR_MODISTA" && t.estado === "EN_PROCESO",
      );
    }
    return [];
  }, [mode, tareas]);

  const gruposTareas = useMemo(
    () => groupTareasPorReserva(visibleTareas),
    [visibleTareas],
  );

  const visibleReservas = useMemo(() => {
    if (mode !== "DEVOLUCIONES_CLIENTES" && mode !== "RETIROS_CLIENTES")
      return [];
    return reservas.filter((r) =>
      mode === "DEVOLUCIONES_CLIENTES"
        ? r.estadoReserva === "EN_CURSO"
        : r.estadoReserva === "LISTO_PARA_ENTREGAR" ||
          r.estadoReserva === "CONFIRMADA",
    );
  }, [mode, reservas]);

  const handleSearch = async () => {
    if (!canSearch) {
      toast.error("Selecciona desde y hasta para continuar");
      return;
    }
    if (hasta < desde) {
      toast.error(
        "La fecha de hasta no puede ser anterior a la fecha de desde",
      );
      return;
    }
    try {
      setIsLoading(true);
      if (mode === "LLEVAR_LAVANDERIA" || mode === "RETIRAR_LAVANDERIA") {
        const data = await listarTareasOperativas({
          tipoTarea: "LLEVAR_LAVANDERIA",
        });
        setTareas(data);
        setReservas([]);
      } else if (mode === "LLEVAR_MODISTA" || mode === "RETIRAR_MODISTA") {
        const data = await listarTareasOperativas({
          tipoTarea: "LLEVAR_MODISTA",
        });
        setTareas(data);
        setReservas([]);
      } else {
        const data = await listarReservasRango(desde, hasta);
        setReservas(data);
        setTareas([]);
        if (mode === "RETIROS_CLIENTES" && data.length > 0) {
          const ids = data.map((r) => r.id).join(",");
          const tareasCtx = await listarTareasOperativas({
            reservaIds: ids,
          });
          setTareasRetiroContexto(tareasCtx);
        } else {
          setTareasRetiroContexto([]);
        }
      }
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo montaje
  }, []);

  const abrirModalLavanderia = (grupo: GrupoTareasReserva) => {
    const tienePantalon = grupo.tareas.some((t) => t.tipoPrenda === "PANTALON");
    setLavModalPantalon(tienePantalon);
    setLavModalReservaId(grupo.reservaId);
  };

  const abrirModalModista = (grupo: GrupoTareasReserva) => {
    const tienePantalon = grupo.tareas.some((t) => t.tipoPrenda === "PANTALON");
    setModModalPantalon(tienePantalon);
    setModModalReservaId(grupo.reservaId);
  };

  const abrirModalMediciones = (grupo: GrupoTareasReserva) => {
    const tienePantalon = grupo.tareas.some((t) => t.tipoPrenda === "PANTALON");
    setMedModalPantalon(tienePantalon);
    setMedModalReservaId(grupo.reservaId);
  };

  const handleRecibirGrupoLavanderia = async (reservaId: number) => {
    try {
      await registrarRecibirLavanderiaPorReserva(reservaId);
      toast.success("Prendas recibidas de lavandería");
      await handleSearch();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    }
  };

  const handleRecibirGrupoModista = (grupo: GrupoTareasReserva) => {
    setRecibirModistaGrupo(grupo);
    setRecibirModistaTareaId(null);
    setRecibirModistaOpen(true);
  };

  const handleRecibirModistaTarea = (tarea: TareaOperativa) => {
    setRecibirModistaGrupo(null);
    setRecibirModistaTareaId(tarea.id);
    setRecibirModistaOpen(true);
  };

  const handleConfirmarRecibirModista = async (costoModista: number) => {
    try {
      setRecibirModistaLoading(true);
      if (recibirModistaGrupo) {
        await registrarRecibirModistaPorReserva(recibirModistaGrupo.reservaId, { costoModista });
        toast.success("Prendas recibidas de modista");
      } else if (recibirModistaTareaId) {
        await marcarRecibidoModista(recibirModistaTareaId, { costoModista });
        toast.success("Prenda recibida de modista");
      }
      setRecibirModistaOpen(false);
      setRecibirModistaGrupo(null);
      setRecibirModistaTareaId(null);
      await handleSearch();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setRecibirModistaLoading(false);
    }
  };

  const nombreModistaParaModal = (): string => {
    const grupo = recibirModistaGrupo;
    if (!grupo) return "la modista";
    return (
      grupo.tareas[0]?.reserva?.asignacionesServicio
        ?.find((a) => a.tipoPrenda === "SACO")
        ?.modista?.nombre ?? "la modista"
    );
  };

  const handleConfirmarRetiroConExtras = async (
    extras: { accesorioId: number; observacion: string | null }[],
  ) => {
    if (!retiroAccesoriosReserva) return;
    try {
      setRetiroConfirming(true);
      await setExtrasReserva(retiroAccesoriosReserva.id, { extras });
      setRetiroPendingReserva(retiroAccesoriosReserva);
      setRetiroAccesoriosReserva(null);
      setRecordatorioOpen(true);
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setRetiroConfirming(false);
    }
  };

  const handleConfirmarRecordatorio = async () => {
    if (!retiroPendingReserva) return;
    try {
      setRetiroConfirming(true);
      await ejecutarRetiroCliente(retiroPendingReserva);
      setRetiroPendingReserva(null);
      setRecordatorioOpen(false);
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    } finally {
      setRetiroConfirming(false);
    }
  };

  const ejecutarRetiroCliente = async (reserva: Reserva) => {
    await marcarReservaRetirada(
      reserva.id,
      reservaTieneTareasOperativasAbiertas(tareasRetiroContexto, reserva.id)
        ? "Retiro en local con tareas operativas pendientes"
        : undefined,
    );
    toast.success("Reserva marcada como retirada");
    await handleSearch();
  };

  const solicitarRetiroCliente = (reserva: Reserva) => {
    if (!prendasEnTiendaParaRetiroCliente(reserva)) return;
    const conAdvertencia = reservaTieneTareasOperativasAbiertas(
      tareasRetiroContexto,
      reserva.id,
    );

    if (conAdvertencia) {
      toast.warning(
        "Esta reserva todavía tiene tareas pendientes. Finalize las tareas pendientes para continuar.",
      );
      return;
    }
    if (reserva.estadoReserva !== "LISTO_PARA_ENTREGAR") {
      toast.warning(
        "Esta reserva no está lista para entregar. Prepare la entrega para continuar.",
      );
      return;
    }

    // Abrir modal de accesorios antes de ejecutar el retiro
    setRetiroAccesoriosReserva(reserva);
    if (accesorios.length === 0) {
      setLoadingAccesorios(true);
      listarAccesorios()
        .then((data) => setAccesorios(data))
        .catch(() => setAccesorios([]))
        .finally(() => setLoadingAccesorios(false));
    }
  };

  const grupoTieneSacoEnTienda = (grupo: GrupoTareasReserva): boolean => {
    const sacoTask = grupo.tareas.find((t) => t.tipoPrenda === "SACO");
    return sacoTask ? tareaConPrendaEnTienda(sacoTask) : false;
  };

  const renderCeldaPrendas = (grupo: GrupoTareasReserva) => (
    <ul className="list-inside list-none text-sm flex flex-col gap-1">
      {grupo.tareas.map((row) => (
        <li
          key={row.id}
          className="flex flex-row gap-1 justify-between min-w-max"
        >
          {row.tipoPrenda === "SACO"
            ? `Saco ${row.saco?.codigo ?? "-"}`
            : `Pantalón ${row.pantalon?.codigo ?? "-"}`}{" "}
          <Chip
            color={`${row.prioridad === "ALTA" ? "danger" : row.prioridad === "MEDIA" ? "warning" : "secondary"}`}
            size="sm"
            className="text-pastel-text"
          >
            {getPrioridadTareaOperativaLabel(row.prioridad)}
          </Chip>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-4 p-4 md:p-6">
      <ConfirmModal ref={confirmModalRef} />

      <AccesoriosRetiroModal
        isOpen={retiroAccesoriosReserva !== null}
        accesorios={accesorios}
        loadingAccesorios={loadingAccesorios}
        confirming={retiroConfirming}
        onConfirm={(extras) => void handleConfirmarRetiroConExtras(extras)}
        onCancel={() => setRetiroAccesoriosReserva(null)}
      />

      <RecordatorioRetiroModal
        isOpen={recordatorioOpen}
        confirming={retiroConfirming}
        onConfirm={() => void handleConfirmarRecordatorio()}
        onCancel={() => {
          setRecordatorioOpen(false);
          setRetiroPendingReserva(null);
        }}
      />

      <div className="rounded-lg border border-pastel-border bg-pastel-surface p-4">
        <h1 className="text-2xl font-semibold text-pastel-text">{ui.title}</h1>
        <p className="mt-1 text-sm text-pastel-text/80">{ui.description}</p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <ApiDateField label="Desde" value={desde} onChange={setDesde} />
          <ApiDateField label="Hasta" value={hasta} onChange={setHasta} />
          <Button
            color="primary"
            className="self-end"
            isDisabled={!canSearch}
            onPress={() => void handleSearch()}
          >
            Actualizar listado
          </Button>
        </div>
      </div>

      {/*    <ControlPreEntregaModal
        isOpen={modalPrepararEntregaOperativas}
        onOpenChange={(open) => {
          if (!open) setModalPrepararEntregaOperativas(false);
        }}
        reservaId={reservaToPick?.id ?? null}
        numeroReservaLabel={reservaToPick?.id ? `#${reservaToPick.id}` : ""}
        clienteNombre={reservaToPick?.clienteNombre ?? ""}
        onGuardado={() => ejecutarRetiroCliente()}
      /> */}

      <RecibirModistaModal
        isOpen={recibirModistaOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRecibirModistaOpen(false);
            setRecibirModistaGrupo(null);
            setRecibirModistaTareaId(null);
          }
        }}
        nombreModista={nombreModistaParaModal()}
        isLoading={recibirModistaLoading}
        onConfirmar={(costo) => void handleConfirmarRecibirModista(costo)}
      />
      <MedicionesReservaModal
        isOpen={medModalReservaId != null}
        onOpenChange={(open) => {
          if (!open) setMedModalReservaId(null);
        }}
        reservaId={medModalReservaId}
        tienePantalon={medModalPantalon}
        onGuardado={() => void handleSearch()}
      />
      <EnvioLavanderiaReservaModal
        isOpen={lavModalReservaId != null}
        onOpenChange={(open) => {
          if (!open) setLavModalReservaId(null);
        }}
        reservaId={lavModalReservaId}
        tienePantalon={lavModalPantalon}
        onGuardado={() => void handleSearch()}
      />
      <EnvioModistaReservaModal
        isOpen={modModalReservaId != null}
        onOpenChange={(open) => {
          if (!open) setModModalReservaId(null);
        }}
        reservaId={modModalReservaId}
        tienePantalon={modModalPantalon}
        onGuardado={() => void handleSearch()}
      />
      <DevolucionRecepcionModal
        isOpen={devolucionModalReserva != null}
        onOpenChange={(open) => {
          if (!open) setDevolucionModalReserva(null);
        }}
        reservaId={devolucionModalReserva?.id ?? null}
        numeroReservaLabel={
          devolucionModalReserva != null ? `#${devolucionModalReserva.id}` : ""
        }
        onGuardado={() => void handleSearch()}
      />

      {isLoading ? (
        <div className="flex h-28 items-center justify-center">
          <Spinner color="secondary" />
        </div>
      ) : mode === "LLEVAR_LAVANDERIA" ||
        mode === "RETIRAR_LAVANDERIA" ||
        mode === "LLEVAR_MODISTA" ||
        mode === "RETIRAR_MODISTA" ? (
        <Table aria-label={ui.title}>
          <TableHeader>
            {[
              <TableColumn key="reserva" className={TABLE_HEADER_CLASS}>
                Reserva
              </TableColumn>,
              <TableColumn key="cliente" className={TABLE_HEADER_CLASS}>
                Cliente
              </TableColumn>,
              ...(mode === "RETIRAR_LAVANDERIA"
                ? [
                    <TableColumn
                      key="lav"
                      className={`min-w-[15rem] ${TABLE_HEADER_CLASS}`}
                    >
                      Lavandería
                    </TableColumn>,
                  ]
                : []),
              ...(mode === "RETIRAR_MODISTA"
                ? [
                    <TableColumn
                      key="mod"
                      className={`min-w-[15rem] ${TABLE_HEADER_CLASS}`}
                    >
                      Modista
                    </TableColumn>,
                  ]
                : []),
              <TableColumn key="prendas" className={TABLE_HEADER_CLASS}>
                Prendas
              </TableColumn>,
              <TableColumn key="accion" className={TABLE_HEADER_CLASS}>
                Acción
              </TableColumn>,
            ]}
          </TableHeader>
          <TableBody
            emptyContent={ui.emptyTareas ?? "No hay datos para este filtro."}
          >
            {gruposTareas.map((grupo) => (
              <TableRow key={grupo.reservaId}>
                {[
                  <TableCell key="r">#{grupo.reservaId}</TableCell>,
                  <TableCell key="c">{grupo.clienteNombre ?? "-"}</TableCell>,
                  ...(mode === "RETIRAR_LAVANDERIA"
                    ? [
                        <TableCell
                          key="lav"
                          className=" flex flex-col gap-1 whitespace-normal text-sm"
                        >
                          {resumenLavanderiasReservaDetalle(
                            grupo.tareas[0]?.reserva,
                          ).map((l) => (
                            <p className="font-bold" key={l}>
                              {l}
                            </p>
                          ))}
                        </TableCell>,
                      ]
                    : []),
                  ...(mode === "RETIRAR_MODISTA"
                    ? [
                        <TableCell
                          key="mod"
                          className="flex flex-col gap-1 whitespace-normal text-sm"
                        >
                          {resumenModistasReservaDetalle(
                            grupo.tareas[0]?.reserva,
                          ).map((l) => (
                            <p key={l}>{l}</p>
                          ))}
                        </TableCell>,
                      ]
                    : []),
                  <TableCell key="p">{renderCeldaPrendas(grupo)}</TableCell>,
                  <TableCell key="a">
                    {mode === "LLEVAR_LAVANDERIA" ? (
                      <Tooltip
                        content="El traje no está disponible en el local"
                        isDisabled={grupoTieneSacoEnTienda(grupo)}
                      >
                        <span>
                          <Button
                            size="sm"
                            color="primary"
                            isDisabled={!grupoTieneSacoEnTienda(grupo)}
                            onPress={() => abrirModalLavanderia(grupo)}
                          >
                            Registrar envío a lavandería
                          </Button>
                        </span>
                      </Tooltip>
                    ) : mode === "RETIRAR_LAVANDERIA" ? (
                      <Button
                        size="sm"
                        color="secondary"
                        onPress={() =>
                          void handleRecibirGrupoLavanderia(grupo.reservaId)
                        }
                      >
                        Recibir de lavandería ({grupo.tareas.length}{" "}
                        {grupo.tareas.length === 1 ? "prenda" : "prendas"})
                      </Button>
                    ) : mode === "LLEVAR_MODISTA" ? (
                      <div className="flex flex-row gap-1">
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => abrirModalMediciones(grupo)}
                        >
                          Ver Mediciones
                        </Button>
                        <Tooltip
                          content="El traje no está disponible en el local"
                          isDisabled={grupoTieneSacoEnTienda(grupo)}
                        >
                          <span>
                            <Button
                              size="sm"
                              color="primary"
                              isDisabled={!grupoTieneSacoEnTienda(grupo)}
                              onPress={() => abrirModalModista(grupo)}
                            >
                              Registrar envío a modista
                            </Button>
                          </span>
                        </Tooltip>
                      </div>
                    ) : (
                      <div className="flex flex-row gap-1">
                        <Button
                          size="sm"
                          color="secondary"
                          onPress={() => handleRecibirGrupoModista(grupo)}
                        >
                          Recibir todo ({grupo.tareas.length})
                        </Button>
                        {grupo.tareas.map((t) => (
                          <Button
                            key={t.id}
                            size="sm"
                            variant="flat"
                            onPress={() => handleRecibirModistaTarea(t)}
                          >
                            Solo{" "}
                            {t.saco
                              ? `Saco "${t.saco.codigo}"`
                              : t.pantalon
                                ? `Pantalón "${t.pantalon?.codigo}"`
                                : ""}
                          </Button>
                        ))}
                      </div>
                    )}
                  </TableCell>,
                ]}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Table aria-label={ui.title}>
          <TableHeader>
            <TableColumn className={TABLE_HEADER_CLASS}>Reserva</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Fecha</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Saco</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Pantalón</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Cliente</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>
              Ubicación actual
            </TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Acción</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={ui.emptyReservas ?? "No hay datos para este filtro."}
          >
            {visibleReservas.map((row) => (
              <TableRow key={row.id}>
                <TableCell>#{row.id}</TableCell>
                <TableCell>{formatApiDateForUi(row.fechaReserva)}</TableCell>
                <TableCell>{`${row.saco.codigo} (${row.saco.marca})`}</TableCell>
                <TableCell>
                  {row.pantalon
                    ? `${row.pantalon.codigo} (${row.pantalon.marca})`
                    : "-"}
                </TableCell>
                <TableCell>{row.clienteNombre}</TableCell>
                <TableCell>
                  {row.pantalon
                    ? `S:${getEstadoUbicacionPrendaLabel(row.saco.ubicacionActual)} / P:${getEstadoUbicacionPrendaLabel(row.pantalon.ubicacionActual)}`
                    : getEstadoUbicacionPrendaLabel(row.saco.ubicacionActual)}
                </TableCell>
                <TableCell>
                  {mode === "RETIROS_CLIENTES" ? (
                    <div className="flex flex-row items-center gap-1">
                      <Tooltip
                        content="Preparar entrega antes de retirar"
                        isDisabled={
                          prendasEnTiendaParaRetiroCliente(row) &&
                          row.estadoReserva === "LISTO_PARA_ENTREGAR"
                        }
                      >
                        <span>
                          <Button
                            size="sm"
                            color={
                              row.estadoReserva !== "LISTO_PARA_ENTREGAR"
                                ? "warning"
                                : "primary"
                            }
                            isDisabled={
                              !prendasEnTiendaParaRetiroCliente(row) ||
                              row.estadoReserva !== "LISTO_PARA_ENTREGAR"
                            }
                            onPress={() => void solicitarRetiroCliente(row)}
                          >
                            Registrar Retiro
                          </Button>
                        </span>
                      </Tooltip>
                      {row.estadoReserva !== "LISTO_PARA_ENTREGAR" && (
                        <Tooltip content="Ir a preparar entrega">
                          <Button
                            as={Link}
                            href="/planillas/local/preparar-entrega"
                            size="sm"
                            isIconOnly
                            variant="flat"
                            aria-label="Ir a preparar entrega"
                          >
                            <svg
                              aria-hidden="true"
                              fill="none"
                              height="1em"
                              viewBox="0 0 24 24"
                              width="1em"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                              <rect x="9" y="3" width="6" height="4" rx="1" />
                              <path d="m9 12 2 2 4-4" />
                            </svg>
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      color="secondary"
                      onPress={() => setDevolucionModalReserva(row)}
                    >
                      Registrar devolución en el local
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
