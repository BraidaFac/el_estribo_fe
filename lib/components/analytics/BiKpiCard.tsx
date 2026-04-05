type ColorVariant = "default" | "success" | "danger" | "warning";

const colorClasses: Record<ColorVariant, string> = {
  default: "border-pastel-border bg-pastel-surface text-pastel-text",
  success: "border-green-200 bg-green-50 text-green-800",
  danger: "border-red-200 bg-red-50 text-red-800",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
};

type BiKpiCardProps = {
  label: string;
  value: number;
  sub?: string;
  color?: ColorVariant;
};

export function BiKpiCard({ label, value, sub, color = "default" }: BiKpiCardProps) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-xl border px-4 py-3 ${colorClasses[color]}`}
    >
      <span className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</span>
      <span className="text-3xl font-bold">{value.toLocaleString("es-AR")}</span>
      {sub && <span className="text-xs opacity-60">{sub}</span>}
    </div>
  );
}
