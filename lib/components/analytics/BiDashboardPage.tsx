"use client";

import type { BiQueryParams, BiResponse } from "@/lib/domain/analytics/types";
import { fetchBiData } from "@/lib/services/v2/analytics-v2.service";
import { getUserFacingErrorMessage } from "@/lib/utils/apiErrorMessage";
import { Spinner } from "@heroui/react";
import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { BiFilterBar } from "./BiFilterBar";
import { BiKpiCard } from "./BiKpiCard";
import { DevolucionesChart } from "./DevolucionesChart";
import { EvolucionReservasChart } from "./EvolucionReservasChart";
import { LavadosChart } from "./LavadosChart";
import { ModistasChart } from "./ModistasChart";
import { PreEntregaChart } from "./PreEntregaChart";

function defaultParams(): BiQueryParams {
  const today = new Date();
  const desde = format(new Date(today.getFullYear(), today.getMonth(), 1), "yyyy-MM-dd");
  const hasta = format(today, "yyyy-MM-dd");
  return { desde, hasta, granularidad: "MES" };
}

export function BiDashboardPage() {
  const [params, setParams] = useState<BiQueryParams>(defaultParams);
  const [data, setData] = useState<BiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (p: BiQueryParams) => {
    try {
      setLoading(true);
      const result = await fetchBiData(p);
      setData(result);
    } catch (e) {
      toast.error(getUserFacingErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(params);
  }, [load, params]);

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="rounded-xl border border-pastel-border bg-pastel-surface p-4">
        <h1 className="text-2xl font-semibold text-pastel-text">Analytics</h1>
        <p className="mt-1 text-sm text-pastel-text/70">
          Métricas agregadas por fecha de reserva.
        </p>
      </div>

      <BiFilterBar params={params} onChange={setParams} loading={loading} />

      {loading && !data ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner color="secondary" />
        </div>
      ) : data ? (
        <>
          {/* Fila 1 — métricas de reservas y pre-entrega */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <BiKpiCard
              label="Reservas"
              value={data.evolucionReservas.reduce((s, p) => s + p.totalReservas, 0)}
            />
            <BiKpiCard
              label="Controles aprobados"
              value={data.preEntrega.aprobados}
              color="success"
            />
            <BiKpiCard
              label="Controles rechazados"
              value={data.preEntrega.rechazados}
              color="danger"
            />
          </div>

          {/* Fila 2 — devoluciones y costos operativos */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <BiKpiCard
              label="Devoluciones exitosas"
              value={data.devoluciones.perfectasCondiciones}
              color={data.devoluciones.perfectasCondiciones > 0 ? "success" : "default"}
            />
            <BiKpiCard
              label="Total lavados"
              value={data.lavados.totalLavados}
            />
            <BiKpiCard
              label="Costo lavados ($)"
              value={Math.round(data.lavados.costoTotal)}
            />
            <BiKpiCard
              label="Costo modistas ($)"
              value={Math.round(data.modistas.costoTotal)}
            />
          </div>

          <EvolucionReservasChart
            data={data.evolucionReservas}
            granularidad={data.filtros.granularidad}
          />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <PreEntregaChart resumen={data.preEntrega} />
            <DevolucionesChart resumen={data.devoluciones} />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <LavadosChart
              resumen={data.lavados}
              granularidad={data.filtros.granularidad}
            />
            <ModistasChart
              resumen={data.modistas}
              granularidad={data.filtros.granularidad}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
