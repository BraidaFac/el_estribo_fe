"use client";

import type { BiEvolucionPunto, Granularidad } from "@/lib/domain/analytics/types";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatPeriodo(periodo: string, granularidad: Granularidad): string {
  if (granularidad === "MES") {
    try {
      const d = parse(periodo, "yyyy-MM", new Date());
      return format(d, "MMM yyyy", { locale: es });
    } catch {
      return periodo;
    }
  }
  // SEMANA: "2025-W03"
  const match = periodo.match(/^(\d{4})-W(\d{2})$/);
  if (match) return `Sem ${match[2]} ${match[1]}`;
  return periodo;
}

type EvolucionReservasChartProps = {
  data: BiEvolucionPunto[];
  granularidad: Granularidad;
};

export function EvolucionReservasChart({ data, granularidad }: EvolucionReservasChartProps) {
  const chartData = data.map((p) => ({
    ...p,
    label: formatPeriodo(p.periodo, granularidad),
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-pastel-border text-sm text-pastel-text/50">
        Sin datos para el período seleccionado
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-pastel-border bg-pastel-surface p-4">
      <p className="mb-4 text-sm font-semibold text-pastel-text">Evolución de reservas</p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
            formatter={(value) => [value, "Reservas"]}
          />
          <Line
            type="monotone"
            dataKey="totalReservas"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ r: 3, fill: "#8b5cf6" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
