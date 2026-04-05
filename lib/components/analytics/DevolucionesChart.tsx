"use client";

import type { BiDevolucionesResumen } from "@/lib/domain/analytics/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DevolucionesChartProps = {
  resumen: BiDevolucionesResumen;
};

export function DevolucionesChart({ resumen }: DevolucionesChartProps) {
  const data = [
    { name: "Perfectas", valor: resumen.perfectasCondiciones, fill: "#10b981" },
    { name: "Malas cond.", valor: resumen.malasCondiciones, fill: "#f59e0b" },
    { name: "Con cargo", valor: resumen.conCargoAdicional, fill: "#ef4444" },
  ];

  return (
    <div className="rounded-xl border border-pastel-border bg-pastel-surface p-4">
      <p className="mb-4 text-sm font-semibold text-pastel-text">
        Estado de devoluciones
        <span className="ml-2 text-xs font-normal text-pastel-text/60">
          ({resumen.total} total)
        </span>
      </p>

      {resumen.total === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-pastel-text/50">
          Sin devoluciones en el período
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
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
              formatter={(value) => [value, "Devoluciones"]}
            />
            <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-pastel-border/60 pt-3 text-center text-xs text-pastel-text/70">
        <div>
          <div className="font-semibold text-green-700">{resumen.perfectasCondiciones}</div>
          <div>Perfectas</div>
        </div>
        <div>
          <div className="font-semibold text-yellow-700">{resumen.malasCondiciones}</div>
          <div>Malas cond.</div>
        </div>
        <div>
          <div className="font-semibold text-red-700">{resumen.conCargoAdicional}</div>
          <div>Con cargo</div>
        </div>
      </div>
    </div>
  );
}
