"use client";

import { EnvioLavanderiaReservaModal } from "@/lib/components/planillas/EnvioLavanderiaReservaModal";
import { EnvioModistaReservaModal } from "@/lib/components/planillas/EnvioModistaReservaModal";
import { ApiDateField } from "@/lib/components/ui/ApiDateField";
import {
  resumenLavanderiasReservaDetalle,
  resumenModistasReservaDetalle,
} from "@/lib/domain/reservas/asignacionesServicio";
import {
  getEstadoUbicacionPrendaLabel,
  getPrioridadTareaOperativaLabel
} from "@/lib/domain/reservas/labels";
import { Reserva, TareaOperativa } from "@/lib/domain/reservas/types";
import {
  PLANILLA_OPERACIONES_UI,
  type PlanillaOperacionesMode,
} from "@/lib/planillas/planillaOperacionesConfig";
import {
  listarReservasRango,
  listarTareasOperativas,
  marcarReservaDevuelta,
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
} from "@heroui/react";
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

export function PlanillaOperacionesPage({ mode }: PlanillaOperacionesPageProps) {
  const ui = PLANILLA_OPERACIONES_UI[mode];
  const [desde, setDesde] = useState(() => defaultDesdeHasta().desde);
  const [hasta, setHasta] = useState(() => defaultDesdeHasta().hasta);
  const [isLoading, setIsLoading] = useState(false);
  const [tareas, setTareas] = useState<TareaOperativa[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [lavModalReservaId, setLavModalReservaId] = useState<number | null>(null);
  const [lavModalPantalon, setLavModalPantalon] = useState(false);
  const [modModalReservaId, setModModalReservaId] = useState<number | null>(null);
  const [modModalPantalon, setModModalPantalon] = useState(false);

  const canSearch = !!desde && !!hasta;

  const visibleTareas = useMemo(() => {
    if (mode === "LLEVAR_LAVANDERIA" || mode === "RETIRAR_LAVANDERIA") {
      return tareas.filter(
        (t) =>
          t.tipoTarea === "LLEVAR_LAVANDERIA" &&
          (mode === "LLEVAR_LAVANDERIA" ? t.estado === "PENDIENTE" : t.estado === "EN_PROCESO"),
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
    if (mode !== "DEVOLUCIONES_CLIENTES" && mode !== "RETIROS_CLIENTES") return [];
    return reservas.filter((r) =>
      mode === "DEVOLUCIONES_CLIENTES" ? r.estadoReserva === "EN_CURSO" : r.estadoReserva === "CONFIRMADA",
    );
  }, [mode, reservas]);

  const handleSearch = async () => {
    if (!canSearch) {
      toast.error("Selecciona desde y hasta para continuar");
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

  const handleRecibirGrupoLavanderia = async (reservaId: number) => {
    try {
      await registrarRecibirLavanderiaPorReserva(reservaId);
      toast.success("Prendas recibidas de lavandería");
      await handleSearch();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    }
  };

  const handleRecibirGrupoModista = async (reservaId: number) => {
    try {
      await registrarRecibirModistaPorReserva(reservaId);
      toast.success("Prendas recibidas de modista");
      await handleSearch();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    }
  };

  const handleRecibirModistaTarea = async (tarea: TareaOperativa) => {
    try {
      await marcarRecibidoModista(tarea.id);
      toast.success("Prenda recibida de modista");
      await handleSearch();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    }
  };

  const handleRetiroCliente = async (reserva: Reserva) => {
    try {
      await marcarReservaRetirada(reserva.id);
      toast.success("Reserva marcada como retirada");
      await handleSearch();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    }
  };

  const handleDevolucionCliente = async (reserva: Reserva) => {
    try {
      await marcarReservaDevuelta(reserva.id);
      toast.success("Reserva marcada como devuelta");
      await handleSearch();
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error));
    }
  };

  const renderCeldaPrendas = (grupo: GrupoTareasReserva) => (
    <ul className="list-inside list-none text-sm flex flex-col gap-1">
      {grupo.tareas.map((row) => (
        <li key={row.id} className="flex flex-row gap-1 justify-between min-w-max">
          {row.tipoPrenda === "SACO"
            ? `Saco ${row.saco?.codigo ?? "-"}`
            : `Pantalón ${row.pantalon?.codigo ?? "-"}`}{" "}
          <Chip color={`${row.prioridad === "ALTA" ? "danger" : row.prioridad === "MEDIA" ? "warning" : "secondary"}`} size="sm" className="text-pastel-text">
            {getPrioridadTareaOperativaLabel(row.prioridad)}
          </Chip>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-4 p-4 md:p-6">
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
                    <TableColumn key="lav" className={ `min-w-[15rem] ${TABLE_HEADER_CLASS}`}>
                      Lavandería
                    </TableColumn>,
                  ]
                : []),
              ...(mode === "RETIRAR_MODISTA"
                ? [
                    <TableColumn key="mod" className={ `min-w-[15rem] ${TABLE_HEADER_CLASS}`}>
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
                          ).map((l) => <p className="font-bold" key={l}>{l}</p>)}
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
                          ).map((l) => <p key={l}>{l}</p>)}
                        </TableCell>,
                      ]
                    : []),
                  <TableCell key="p">{renderCeldaPrendas(grupo)}</TableCell>,
                  <TableCell key="a">
                  {mode === "LLEVAR_LAVANDERIA" ? (
                    <Button
                      size="sm"
                      color="primary"
                      onPress={() => abrirModalLavanderia(grupo)}
                    >
                      Registrar envío a lavandería
                    </Button>
                  ) : mode === "RETIRAR_LAVANDERIA" ? (
                    <Button
                      size="sm"
                      color="secondary"
                      onPress={() => void handleRecibirGrupoLavanderia(grupo.reservaId)}
                    >
                      Recibir de lavandería ({grupo.tareas.length}{" "}
                      {grupo.tareas.length === 1 ? "prenda" : "prendas"})
                    </Button>
                  ) : mode === "LLEVAR_MODISTA" ? (
                    <Button
                      size="sm"
                      color="primary"
                      onPress={() => abrirModalModista(grupo)}
                    >
                      Registrar envío a modista
                    </Button>
                  ) : (
                    <div className="flex flex-row gap-1">
                      <Button
                        size="sm"
                        color="secondary"
                        onPress={() => void handleRecibirGrupoModista(grupo.reservaId)}
                      >
                        Recibir todo ({grupo.tareas.length})
                      </Button>
                      {grupo.tareas.map((t) => (
                        <Button
                          key={t.id}
                          size="sm"
                          variant="flat"
                          onPress={() => void handleRecibirModistaTarea(t)}
                        >
                          Solo {t.saco ? `Saco "${t.saco.codigo}"` :  t.pantalon ? `Pantalón "${t.pantalon?.codigo}"` : ''}
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
            <TableColumn className={TABLE_HEADER_CLASS}>Ubicación actual</TableColumn>
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
                  {row.pantalon ? `${row.pantalon.codigo} (${row.pantalon.marca})` : "-"}
                </TableCell>
                <TableCell>{row.clienteNombre}</TableCell>
                <TableCell>
                  {row.pantalon
                    ? `S:${getEstadoUbicacionPrendaLabel(row.saco.ubicacionActual)} / P:${getEstadoUbicacionPrendaLabel(row.pantalon.ubicacionActual)}`
                    : getEstadoUbicacionPrendaLabel(row.saco.ubicacionActual)}
                </TableCell>
                <TableCell>
                  {mode === "RETIROS_CLIENTES" ? (
                    <Button size="sm" color="primary" onPress={() => void handleRetiroCliente(row)}>
                      Registrar retiro en el local
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      color="secondary"
                      onPress={() => void handleDevolucionCliente(row)}
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
