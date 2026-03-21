"use client";

const ITEMS = [
  { key: "disponible", label: "Disponible", className: "bg-emerald-100 border-emerald-300" },
  { key: "medicion", label: "Medicion", className: "bg-orange-100 border-orange-300" },
  { key: "listo-tienda", label: "Listo en tienda", className: "bg-indigo-100 border-indigo-300" },
  { key: "reserva", label: "Reserva", className: "bg-rose-100 border-rose-300" },
  { key: "modista", label: "Modista", className: "bg-violet-100 border-violet-300" },
  { key: "lavanderia", label: "Lavanderia", className: "bg-sky-100 border-sky-300" },
  { key: "manual", label: "Manual/Mantenimiento", className: "bg-amber-100 border-amber-300" },
  { key: "no-laborable", label: "No laborable", className: "bg-zinc-100 border-zinc-300" },
  { key: "pasado", label: "Fecha pasada", className: "bg-zinc-200 border-zinc-400" },
];

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {ITEMS.map((item) => (
        <div key={item.key} className="inline-flex items-center gap-1.5 text-xs text-pastel-text">
          <span className={`inline-block h-3 w-3 rounded border ${item.className}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
