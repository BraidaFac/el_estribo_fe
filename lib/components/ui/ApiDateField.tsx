"use client";

import { DateInput } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { useMemo } from "react";

type ApiDateFieldProps = {
  label: string;
  /** Valor API `yyyy-MM-dd` */
  value: string;
  onChange: (nextYyyyMmDd: string) => void;
  className?: string;
};

const YMD = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Campo de fecha con segmentos según locale del `HeroUIProvider` (p. ej. día/mes/año en es-AR).
 * El estado externo sigue siendo `yyyy-MM-dd` para el API.
 */
export function ApiDateField({ label, value, onChange, className }: ApiDateFieldProps) {
  const dateValue = useMemo(() => {
    try {
      if (!value || !YMD.test(value)) return null;
      return parseDate(value);
    } catch {
      return null;
    }
  }, [value]);

  return (
    <DateInput
      label={label}
      className={className}
      granularity="day"
      value={dateValue}
      onChange={(v) => {
        if (v == null) {
          onChange("");
          return;
        }
        onChange(v.toString());
      }}
    />
  );
}
