"use client";

import type { BiLavadosResumen, Granularidad } from "@/lib/domain/analytics/types";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
  const match = periodo.match(/^(\d{4})-W(\d{2})$/);
  if (match) return `Sem ${match[2]} ${match[1]}`;
  return periodo;
}

type LavadosChartProps = {
  resumen: BiLavadosResumen;
  granularidad: Granularidad;
};

export function LavadosChart({ resumen, granularidad }: LavadosChartProps) {
  const chartData = resumen.evolucion.map((p) => ({
    ...p,
    label: formatPeriodo(p.periodo, granularidad),
  }));

  return (
    <div className="rounded-xl border border-pastel-border bg-pastel-surface p-4">
      <p className="mb-1 text-sm font-semibold text-pastel-text">
        Lavados por período
      </p>
      <p className="mb-4 text-xs text-pastel-text/60">
        {resumen.totalLavados} lavados — costo total $
        {resumen.costoTotal.toLocaleString("es-AR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>

      {chartData.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-pastel-text/50">
          Sin lavados en el período
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
            />
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
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
              formatter={(value, name) => [
                name === "cantidad"
                  ? `${value} lavados`
                  : `$${Number(value).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
                name === "cantidad" ? "Cantidad" : "Costo",
              ]}
            />
            <Bar
              dataKey="cantidad"
              fill="#06b6d4"
              radius={[4, 4, 0, 0]}
              name="cantidad"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
