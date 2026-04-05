"use client";

import type {
  DashboardCategoria,
  DashboardItem,
  DashboardOperativoResponse,
  DashboardUrgencia,
  ReservaConAccionesView,
} from "@/lib/domain/dashboard/types";
import { getEstadoReservaLabel } from "@/lib/domain/reservas/labels";
import { fetchDashboardOperativo } from "@/lib/services/v2/reservas-v2.service";
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
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const CATEGORIA_LABEL: Record<DashboardCategoria, string> = {
  llevar_lavanderia: "Llevar lavandería",
  retirar_lavanderia: "Retirar lavandería",
  llevar_modista: "Llevar modista",
  retirar_modista: "Retirar modista",
  contactar_medicion: "Contactar medición",
  retiro_cliente: "Retiro cliente",
  devolucion_cliente: "Devolución cliente",
  agenda_medicion: "Agenda medición",
};

const URGENCIA_LABEL: Record<DashboardUrgencia, string> = {
  VENCIDA: "Tareas atrasadas",
  HOY: "Para hoy",
  PROXIMA: "Tareas Próximos días",
  FUTURA: "Tareas Más adelante",
  SIN_FECHA: "Sin fecha objetivo",
};

const URGENCIA_ORDER: DashboardUrgencia[] = [
  "HOY",
  "VENCIDA",
  "PROXIMA",
  "FUTURA",
  "SIN_FECHA",
];

function chipColorUrgencia(
  u: DashboardUrgencia,
): "danger" | "warning" | "primary" | "default" | "secondary" {
  if (u === "VENCIDA") return "danger";
  if (u === "HOY") return "warning";
  if (u === "PROXIMA") return "secondary";
  if (u === "FUTURA") return "default";
  return "secondary";
}

function formatFechaRef(iso: string | null): string {
  if (!iso) return "—";
  return formatApiDateForUi(iso);
}

/** Solo parte yyyy-MM-dd para comparar fechas. */
function soloFecha(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return iso.includes("T") ? iso.split("T")[0]! : iso;
}

/** Día de la reserva del traje (evento), si viene en el payload del ítem. */
function getFechaReservaDesdeItem(item: DashboardItem): string | null {
  const r =
    item.reserva?.fechaReserva ??
    item.tarea?.reserva?.fechaReserva ??
    item.agenda?.reserva?.fechaReserva;
  return r ?? null;
}

export function DashboardOperativoPage() {
  const [data, setData] = useState<DashboardOperativoResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchDashboardOperativo();
      setData(res);
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const grupos = useMemo(() => {
    if (!data?.items.length) return [];
    return URGENCIA_ORDER.map((u) => ({
      urgencia: u,
      items: data.items.filter((i) => i.urgencia === u),
    })).filter((g) => g.items.length > 0);
  }, [data]);

  const topTipos = useMemo(() => {
    if (!data?.porCategoria) return [];
    return Object.entries(data.porCategoria)
      .filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [data]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <header className="rounded-lg border border-pastel-border bg-pastel-surface p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-pastel-text">
              Panel operativo
            </h1>
          </div>
          <Button
            color="primary"
            variant="flat"
            isDisabled={loading}
            onPress={() => void load()}
          >
            Actualizar
          </Button>
        </div>

        {data && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip size="sm" variant="flat" className="text-pastel-text">
              Total {data.resumen.total}
            </Chip>
            {data.resumen.hoy > 0 && (
              <Chip color="warning" size="sm" variant="flat">
                {data.resumen.hoy} hoy
              </Chip>
            )}

            {data.resumen.vencidas > 0 && (
              <Chip color="danger" size="sm" variant="flat">
                {data.resumen.vencidas} vencidas
              </Chip>
            )}

            {data.resumen.proximas > 0 && (
              <Chip color="primary" size="sm" variant="flat">
                {data.resumen.proximas} proximas
              </Chip>
            )}
            {data.resumen.futuras > 0 && (
              <Chip size="sm" variant="flat">
                {data.resumen.futuras} futuras
              </Chip>
            )}
            {data.resumen.sinFecha > 0 && (
              <Chip color="secondary" size="sm" variant="flat">
                {data.resumen.sinFecha} sin fecha
              </Chip>
            )}
          </div>
        )}

        {topTipos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-pastel-border pt-3">
            <span className="w-full text-xs font-medium uppercase tracking-wide text-pastel-text/60">
              Por tipo
            </span>
            {topTipos.map(([key, n]) => (
              <Chip
                key={key}
                size="sm"
                variant="bordered"
                className="text-pastel-text"
              >
                {(CATEGORIA_LABEL as Record<string, string>)[key] ?? key}: {n}
              </Chip>
            ))}
          </div>
        )}
      </header>

      {loading && !data ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner color="secondary" size="lg" />
        </div>
      ) : data ? (
        <div className="space-y-8">
          <ProximasReservasSection reservas={data.proximasReservas ?? []} />
          {!data.items.length ? (
            <div className="rounded-lg border border-dashed border-pastel-border bg-pastel-surface/60 p-8 text-center text-pastel-text/80">
              <p className="font-medium text-pastel-text">
                No hay tareas operativas pendientes
              </p>
              <p className="mt-1 text-sm">
                Cuando haya envíos, retiros, citas o acciones de clientes,
                aparecerán en las secciones de abajo.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {grupos.map((g) => (
                <section key={g.urgencia} className="space-y-3">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-pastel-text">
                    {URGENCIA_LABEL[g.urgencia]}
                    <Chip
                      size="sm"
                      color={chipColorUrgencia(g.urgencia)}
                      variant="flat"
                    >
                      {g.items.length}
                    </Chip>
                  </h2>
                  <ul className="grid gap-2">
                    {g.items.map((item) => (
                      <DashboardRow key={item.id} item={item} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ProximasReservasSection({
  reservas,
}: {
  reservas: ReservaConAccionesView[];
}) {
  const router = useRouter();
  return (
    <section className="rounded-lg border border-pastel-border bg-pastel-surface p-4 md:p-5">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-pastel-text">
            Próximas reservas
          </h2>
        </div>
        <Button
          size="sm"
          color="primary"
          variant="flat"
          onPress={() => router.push("/calendario-v2")}
        >
          Abrir calendario
        </Button>
      </div>
      {reservas.length === 0 ? (
        <p className="text-sm text-pastel-text/70">
          No hay reservas en este rango.
        </p>
      ) : (
        <Table aria-label="Próximas reservas en los próximos días">
          <TableHeader>
            <TableColumn className={TABLE_HEADER_CLASS}>Reserva #</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>
              Fecha reserva
            </TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Estado</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Cliente</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Saco</TableColumn>
            <TableColumn className={TABLE_HEADER_CLASS}>Pantalón</TableColumn>
          </TableHeader>
          <TableBody>
            {reservas.map((r) => (
              <TableRow key={r.id}>
                <TableCell>#{r.id}</TableCell>
                <TableCell>{formatApiDateForUi(r.fechaReserva)}</TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat" className="text-pastel-text">
                    {getEstadoReservaLabel(r.estadoReserva)}
                  </Chip>
                </TableCell>
                <TableCell>{r.clienteNombre}</TableCell>
                <TableCell>{`${r.saco.codigo} (${r.saco.marca})`}</TableCell>
                <TableCell>
                  {r.pantalon
                    ? `${r.pantalon.codigo} (${r.pantalon.marca})`
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  );
}

function DashboardRow({ item }: { item: DashboardItem }) {
  const router = useRouter();
  const fechaReservaTraje = getFechaReservaDesdeItem(item);

  return (
    <li className="flex flex-col gap-2 rounded-lg border border-pastel-border bg-pastel-surface p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-pastel-text">
            {item.titulo}
          </span>
          <Chip size="sm" variant="bordered" className="text-pastel-text">
            {CATEGORIA_LABEL[item.categoria]}
          </Chip>
          {item.prioridad && (
            <Chip size="sm" color="warning" variant="flat">
              {item.prioridad}
            </Chip>
          )}
        </div>
        {item.descripcion ? (
          <p className="text-sm text-pastel-text/75">{item.descripcion}</p>
        ) : null}
        <div className="space-y-0.5 text-xs">
          <p className="text-pastel-text/60">
            <span className="font-medium text-pastel-text/70">
              Fecha tarea:{" "}
            </span>{" "}
            {formatFechaRef(item.fechaReferencia)}
            {item.reservaId != null ? ` · Reserva #${item.reservaId}` : null}
          </p>
          {fechaReservaTraje != null ? (
            <p className="font-medium text-teal-700 dark:text-teal-400">
              Día de la reserva: {formatFechaRef(fechaReservaTraje)}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
        <Chip size="sm" color={chipColorUrgencia(item.urgencia)} variant="flat">
          {URGENCIA_LABEL[item.urgencia]}
        </Chip>
        <Button
          size="sm"
          color="primary"
          variant="flat"
          onPress={() => router.push(item.planillaDestino)}
        >
          Ir a planilla
        </Button>
      </div>
    </li>
  );
}
