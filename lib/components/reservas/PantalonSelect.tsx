"use client";

import { Pantalon } from "@/lib/domain/reservas/types";
import { Select, SelectItem } from "@heroui/react";

type PantalonSelectProps = {
  value?: number;
  options: Pantalon[];
  isLoading?: boolean;
  isDisabled?: boolean;
  onChange: (id?: number) => void;
};

export function PantalonSelect({
  value,
  options,
  isLoading,
  isDisabled,
  onChange,
}: PantalonSelectProps) {
  return (
    <Select
      label="Pantalon (opcional)"
      placeholder="Sin pantalon"
      isClearable
      isLoading={isLoading}
      isDisabled={isDisabled}
      selectedKeys={value ? [String(value)] : []}
      selectionMode="single"
      onSelectionChange={(keys) => {
        const key = Array.from(keys)[0];
        onChange(key ? Number(key) : undefined);
      }}
      description="Se listan solo pantalones disponibles para la fecha seleccionada"
      aria-label="Selector opcional de pantalon"
      className="w-full"
    >
      {options.map((pantalon) => (
        <SelectItem key={String(pantalon.id)}>
          {`${pantalon.codigo} - ${pantalon.talle ?? "s/talle"} - ${pantalon.color ?? "s/color"}`}
        </SelectItem>
      ))}
    </Select>
  );
}
