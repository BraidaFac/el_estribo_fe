"use client";

import type { BiPreEntregaResumen } from "@/lib/domain/analytics/types";
import { MOTIVOS_RECHAZO_LABELS } from "@/lib/domain/control-pre-entrega/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#8b5cf6", "#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#6b7280"];

type PreEntregaChartProps = {
  resumen: BiPreEntregaResumen;
};

export function PreEntregaChart({ resumen }: PreEntregaChartProps) {
  const barData = [
    { name: "Aprobados", valor: resumen.aprobados, fill: "#10b981" },
    { name: "Rechazados", valor: resumen.rechazados, fill: "#ef4444" },
  ];

  const motivoData = Object.entries(resumen.porMotivo)
    .filter(([, v]) => v > 0)
    .map(([motivo, count]) => ({
      name: MOTIVOS_RECHAZO_LABELS[motivo as keyof typeof MOTIVOS_RECHAZO_LABELS] ?? motivo,
      valor: count,
    }));

  return (
    <div className="rounded-xl border border-pastel-border bg-pastel-surface p-4">
      <p className="mb-4 text-sm font-semibold text-pastel-text">
        Controles pre-entrega
        <span className="ml-2 text-xs font-normal text-pastel-text/60">
          ({resumen.total} total)
        </span>
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-pastel-text/70">Resultado</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                formatter={(value) => [value, "Controles"]}
              />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-pastel-text/70">Motivos de rechazo</p>
          {motivoData.length === 0 ? (
            <div className="flex h-44 items-center justify-center text-sm text-pastel-text/50">
              Sin rechazos en el período
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={motivoData}
                  dataKey="valor"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {motivoData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                  formatter={(value) => [value, "Rechazos"]}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
