"use client";

import type { BiQueryParams, Granularidad } from "@/lib/domain/analytics/types";
import { Button } from "@heroui/react";

type BiFilterBarProps = {
  params: BiQueryParams;
  onChange: (params: BiQueryParams) => void;
  loading: boolean;
};

/** yyyy-MM-dd → dd-mm-yyyy */
function toDisplay(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}-${m}-${y}`;
}

/** dd-mm-yyyy → yyyy-MM-dd. Devuelve vacío si el formato es inválido. */
function toIso(display: string): string {
  const parts = display.split("-");
  if (parts.length !== 3) return "";
  const [d, m, y] = parts;
  if (!d || !m || !y || y.length !== 4) return "";
  return `${y}-${m}-${d}`;
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
}) {
  const handleChange = (raw: string) => {
    const iso = toIso(raw);
    if (iso) onChange(iso);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-pastel-text/70">{label}</label>
      <input
        type="text"
        value={toDisplay(value)}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="dd-mm-yyyy"
        maxLength={10}
        className="w-32 rounded-lg border border-pastel-border bg-white px-3 py-2 text-sm text-pastel-text outline-none focus:border-pastel-primary"
      />
    </div>
  );
}

export function BiFilterBar({ params, onChange, loading }: BiFilterBarProps) {
  const setField = <K extends keyof BiQueryParams>(key: K, value: BiQueryParams[K]) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-pastel-border bg-pastel-surface p-4">
      <DateInput
        label="Desde"
        value={params.desde}
        onChange={(iso) => setField("desde", iso)}
      />

      <DateInput
        label="Hasta"
        value={params.hasta}
        onChange={(iso) => setField("hasta", iso)}
      />

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-pastel-text/70">Granularidad</label>
        <div className="flex gap-1">
          {(["MES", "SEMANA"] as Granularidad[]).map((g) => (
            <Button
              key={g}
              size="sm"
              variant={params.granularidad === g ? "solid" : "flat"}
              className={
                params.granularidad === g
                  ? "bg-pastel-primary text-white"
                  : "text-pastel-text"
              }
              onPress={() => setField("granularidad", g)}
              isDisabled={loading}
            >
              {g === "MES" ? "Por mes" : "Por semana"}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
