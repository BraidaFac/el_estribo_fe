"use client";

import {
  resumenLavanderiasReserva,
  resumenModistasReserva,
} from "@/lib/domain/reservas/asignacionesServicio";
import { ReservaDaySummary } from "@/lib/hooks/useDiarioReservas";
import { formatApiDateForUi } from "@/lib/utils/formatApiDate";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function formatDayTitle(dayKey: string): string {
  const weekday = format(new Date(`${dayKey}T12:00:00`), "EEEE", { locale: es });
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${cap}, ${formatApiDateForUi(dayKey)}`;
}

type DiarioReservasListProps = {
  groupedDays: ReservaDaySummary[];
};

export function DiarioReservasList({ groupedDays }: DiarioReservasListProps) {
  if (groupedDays.length === 0) {
    return (
      <div className="rounded border border-pastel-border bg-pastel-surface p-4 text-sm text-pastel-text/80">
        No hay reservas para el rango actual.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedDays.map((group) => (
        <section
          key={group.dayKey}
          className="rounded-lg border border-pastel-border bg-pastel-surface p-4"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-pastel-text">
              {formatDayTitle(group.dayKey)}
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded bg-rose-100 px-2 py-1 text-rose-800">
                Sacos: {group.cantidadSacos}
              </span>
              <span className="rounded bg-sky-100 px-2 py-1 text-sky-800">
                Pantalones: {group.cantidadPantalones}
              </span>
              <span className="rounded bg-zinc-100 px-2 py-1 text-zinc-700">
                Reservas: {group.cantidadReservas}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {group.reservas.map((reserva) => (
              <article
                key={reserva.id}
                className="rounded border border-pastel-border bg-pastel-soft p-3"
              >
                <div className="grid grid-cols-1 gap-2 text-sm text-pastel-text md:grid-cols-2">
                  <p>
                    <strong>Reserva:</strong> #{reserva.id}
                  </p>
                  <p>
                    <strong>Fecha:</strong> {formatApiDateForUi(reserva.fechaReserva)}
                  </p>
                  <p>
                    <strong>Saco:</strong> {reserva.saco.codigo} - {reserva.saco.marca}
                    {reserva.saco.talle ? ` (T${reserva.saco.talle})` : ""}
                  </p>
                  <p>
                    <strong>Pantalón:</strong>{" "}
                    {reserva.pantalon
                      ? `${reserva.pantalon.codigo} - ${reserva.pantalon.marca}${reserva.pantalon.talle ? ` (T${reserva.pantalon.talle})` : ""}`
                      : "Sin pantalón"}
                  </p>
                  <p>
                    <strong>Cliente:</strong> {reserva.clienteNombre}
                  </p>
                  <p>
                    <strong>DNI:</strong> {reserva.clienteDni}
                  </p>
                  <p>
                    <strong>Teléfono:</strong> {reserva.clienteTelefono ?? "-"}
                  </p>
                  <p className="text-sm">
                    <strong>Lavandería:</strong>{"\n"}
                    {resumenLavanderiasReserva(reserva)}
                  </p>
                  <p className="text-sm">
                    <strong>Modista:</strong>{"\n"}
                    {resumenModistasReserva(reserva)}
                  </p>
                  <p>
                    <strong>Requiere modista:</strong>{" "}
                    {reserva.requiereModista ? "Sí" : "No"}
                  </p>
                </div>
                <div className="mt-2 rounded border border-pastel-border bg-white/70 p-2 text-sm">
                  <strong>Observaciones:</strong>{" "}
                  {reserva.observaciones?.trim() ? reserva.observaciones : "Sin observaciones"}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
