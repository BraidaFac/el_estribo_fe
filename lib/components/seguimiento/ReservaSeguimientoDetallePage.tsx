"use client";

import { MedicionesReservaModal } from "@/lib/components/medidas/MedicionesReservaModal";
import { ControlPreEntregaVistaModal } from "@/lib/components/seguimiento/ControlPreEntregaVistaModal";
import { PasosRealizadosTab } from "@/lib/components/seguimiento/PasosRealizadosTab";
import { RecepcionDevolucionVistaModal } from "@/lib/components/seguimiento/RecepcionDevolucionVistaModal";
import { resumenLavanderiasReservaDetalle, resumenModistasReservaDetalle } from "@/lib/domain/reservas/asignacionesServicio";
import {
  getEstadoReservaLabel,
  getEstadoUbicacionPrendaLabel,
} from "@/lib/domain/reservas/labels";
import type { TrazabilidadEvento } from "@/lib/domain/reservas/seguimientoReservas";
import { obtenerDetalleOperativoReserva } from "@/lib/services/v2/reservas-v2.service";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import {
  formatApiDateForUi,
  formatApiDateTimeForUi,
  formatIsoDatesInText,
} from "@/lib/utils/formatApiDate";
import { TABLE_HEADER_CLASS } from "@/lib/utils/uiStyles";
import {
  Button,
  Chip,
  Spinner,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
} from "@heroui/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function labelCategoriaTrazabilidad(c: TrazabilidadEvento["categoria"]): string {
  switch (c) {
    case "reserva":
      return "Reserva";
    case "tarea":
      return "Tarea";
    case "movimiento":
      return "Movimiento";
    case "agenda":
      return "Agenda";
    case "control_pre_entrega":
      return "Pre-entrega";
    case "cliente":
      return "Cliente";
    case "reversion":
      return "Reversión";
    default:
      return c;
  }
}

function formatTrazabilidadFecha(f: string | null): string {
  if (f == null || f.trim() === "") return "—";
  if (f.includes("T")) return formatApiDateTimeForUi(f);
  return formatApiDateForUi(f);
}

export function ReservaSeguimientoDetallePage() {
  const params = useParams();
  const rawId = params?.reservaId;
  const reservaId =
    typeof rawId === "string" ? parseInt(rawId, 10) : Array.isArray(rawId) ? parseInt(rawId[0] ?? "", 10) : NaN;

  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState<Awaited<
    ReturnType<typeof obtenerDetalleOperativoReserva>
  > | null>(null);
  const [openMediciones, setOpenMediciones] = useState(false);
  const [openPreEntrega, setOpenPreEntrega] = useState(false);
  const [openRecepcion, setOpenRecepcion] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isFinite(reservaId)) {
      setDetalle(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const d = await obtenerDetalleOperativoReserva(reservaId);
      setDetalle(d);
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
      setDetalle(null);
    } finally {
      setLoading(false);
    }
  }, [reservaId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!Number.isFinite(reservaId)) {
    return (
      <div className="p-6">
        <p className="text-pastel-text">Identificador de reserva no válido.</p>
        <Button as={Link} href="/seguimiento-reservas" className="mt-4" color="primary">
          Volver al listado
        </Button>
      </div>
    );
  }

  if (loading || !detalle) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center p-6">
        {loading ? <Spinner color="secondary" /> : <p className="text-pastel-text">No se encontró la reserva.</p>}
      </div>
    );
  }

  const { reserva, controlPreEntrega, recepcionDevolucion, trazabilidad } = detalle;
  const numeroLabel = `#${reserva.id}`;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button as={Link} href="/seguimiento-reservas" size="sm" variant="flat">
            ← Volver al listado
          </Button>
          <h1 className="mt-3 text-2xl font-semibold text-pastel-text">
            Reserva {numeroLabel}
          </h1>
         
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="flat" onPress={() => setOpenMediciones(true)}>
            Ver Mediciones
          </Button>
          <Button size="sm" color="primary" variant="flat" onPress={() => setOpenPreEntrega(true)}>
            Ver entrega
          </Button>
          <Button size="sm" color="secondary" variant="flat" onPress={() => setOpenRecepcion(true)}>
            Ver devolución
          </Button>
        </div>
      </div>

      <Tabs aria-label="Secciones de la reserva" variant="underlined" color="secondary">
        <Tab key="informacion" title="Información">
          <section className="rounded-xl border border-pastel-border bg-pastel-surface p-4">
            <h2 className="text-lg font-semibold text-pastel-text">Datos generales</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <p>
                <span className="text-pastel-text/70">Cliente:</span>{" "}
                <span className="font-medium text-pastel-text">{reserva.clienteNombre}</span>
              </p>
              <p>
                <span className="text-pastel-text/70">DNI:</span> {reserva.clienteDni}
              </p>
              <p>
                <span className="text-pastel-text/70">Cuenta:</span> {reserva.nombreCuenta ?? "—"}
              </p>
              <p>
                <span className="text-pastel-text/70">Teléfono:</span> {reserva.clienteTelefono ?? "—"}
              </p>
              <p>
                <span className="text-pastel-text/70">Fecha evento / reserva:</span>{" "}
                {formatApiDateForUi(reserva.fechaReserva)}
              </p>
              <p className="flex flex-wrap items-center gap-2">
                <span className="text-pastel-text/70">Estado:</span>
                <Chip size="sm" variant="flat">
                  {getEstadoReservaLabel(reserva.estadoReserva)}
                </Chip>
              </p>
              <p>
                <span className="text-pastel-text/70">Saco:</span> {reserva.saco.codigo} — {reserva.saco.marca}{" "}
                ({getEstadoUbicacionPrendaLabel(reserva.saco.ubicacionActual)})
              </p>
              <p>
                <span className="text-pastel-text/70">Pantalón:</span>{" "}
                {reserva.pantalon
                  ? `${reserva.pantalon.codigo} — ${reserva.pantalon.marca} (${getEstadoUbicacionPrendaLabel(reserva.pantalon.ubicacionActual)})`
                  : "Sin pantalón"}
              </p>
              <p>
                <span className="text-pastel-text/70">Retiro cliente:</span>{" "}
                {reserva.clienteRetiroAt ? formatApiDateTimeForUi(reserva.clienteRetiroAt) : "—"}
              </p>
              <p>
                <span className="text-pastel-text/70">Devolución cliente:</span>{" "}
                {reserva.clienteDevolvioAt ? formatApiDateTimeForUi(reserva.clienteDevolvioAt) : "—"}
              </p>
            </div>
            <p className="mt-3 whitespace-pre-wrap rounded-lg bg-pastel-soft/80 p-3 text-sm text-pastel-text">
              <span className="font-medium text-pastel-text/80">Observaciones:</span>{" "}
              {reserva.observaciones?.trim() ? reserva.observaciones : "Sin observaciones"}
            </p>
            <div className="mt-3 whitespace-pre-wrap text-sm">
              <p className="font-medium text-pastel-text/80">Lavandería (saco / pantalón)</p>
              <p className="text-pastel-text">{resumenLavanderiasReservaDetalle(reserva)}</p>
            </div>
            <div className="mt-2 whitespace-pre-wrap text-sm">
              <p className="font-medium text-pastel-text/80">Modista (saco / pantalón)</p>
              <p className="text-pastel-text">{resumenModistasReservaDetalle(reserva)}</p>
            </div>
          </section>

          <section className="mt-4 rounded-xl border border-pastel-border bg-pastel-surface p-4">
            <h2 className="text-lg font-semibold text-pastel-text">Trazabilidad operativa</h2>
            <p className="mt-1 text-xs text-pastel-text/75">
              Eventos derivados del sistema (fechas según registro en base de datos).
            </p>
            <Table aria-label="Trazabilidad" className="mt-3">
              <TableHeader>
                <TableColumn className={TABLE_HEADER_CLASS}>Tipo</TableColumn>
                <TableColumn className={TABLE_HEADER_CLASS}>Evento</TableColumn>
                <TableColumn className={TABLE_HEADER_CLASS}>Detalle</TableColumn>
                <TableColumn className={TABLE_HEADER_CLASS}>Fecha</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Sin eventos de trazabilidad.">
                {trazabilidad.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{labelCategoriaTrazabilidad(t.categoria)}</TableCell>
                    <TableCell className="max-w-[14rem]">{t.titulo}</TableCell>
                    <TableCell className="max-w-md whitespace-pre-wrap text-xs">
                      {t.descripcion ? formatIsoDatesInText(t.descripcion) : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">
                      {formatTrazabilidadFecha(t.fecha)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        </Tab>

        <Tab key="pasos" title="Pasos realizados">
          <section className="rounded-xl border border-pastel-border bg-pastel-surface p-4">
            <h2 className="text-lg font-semibold text-pastel-text">Pasos realizados</h2>
            <div className="mt-3">
              <PasosRealizadosTab reservaId={reservaId} onReversion={load} />
            </div>
          </section>
        </Tab>
      </Tabs>

      <MedicionesReservaModal
        isOpen={openMediciones}
        onOpenChange={setOpenMediciones}
        reservaId={reservaId}
        tienePantalon={reserva.pantalon != null}
        readOnly
      />
      <ControlPreEntregaVistaModal
        isOpen={openPreEntrega}
        onOpenChange={setOpenPreEntrega}
        numeroReservaLabel={numeroLabel}
        clienteNombre={reserva.clienteNombre}
        data={controlPreEntrega}
        reservaId={reservaId}
        estadoReserva={reserva.estadoReserva}
      />
      <RecepcionDevolucionVistaModal
        isOpen={openRecepcion}
        onOpenChange={setOpenRecepcion}
        numeroReservaLabel={numeroLabel}
        data={recepcionDevolucion}
        reservaId={reservaId}
      />
    </div>
  );
}
