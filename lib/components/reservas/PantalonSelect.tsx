"use client";

import { Pantalon } from "@/lib/domain/reservas/types";
import { Button, Input, Spinner } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";

type PantalonSelectProps = {
  value?: number;
  options: Pantalon[];
  isLoading?: boolean;
  isDisabled?: boolean;
  onChange: (id?: number) => void;
};

function buildPantalonLabel(p: Pantalon): string {
  const colorPart = p.color?.trim() ? ` - ${p.color.trim()}` : "";
  const tallePart = p.talle ? ` - Talle ${p.talle}` : "";
  return `${p.codigo} - ${p.marca}${colorPart}${tallePart}`;
}

const SEARCH_DEBOUNCE_MS = 300;

function matchesPantalonSearch(p: Pantalon, normalized: string): boolean {
  const hay = `${p.codigo} ${p.marca} ${p.color ?? ""}`.trim().toLowerCase();
  return hay.includes(normalized);
}

export function PantalonSelect({
  value,
  options,
  isLoading,
  isDisabled,
  onChange,
}: PantalonSelectProps) {
  const [query, setQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const selected = useMemo(
    () => options.find((p) => p.id === value) ?? null,
    [options, value],
  );

  useEffect(() => {
    if (query.trim() === "") {
      setDebouncedSearch("");
      return;
    }
    const id = window.setTimeout(() => {
      setDebouncedSearch(query);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (value != null && selected) {
      setQuery(buildPantalonLabel(selected));
    } else if (value == null || (value != null && !selected)) {
      setQuery("");
    }
  }, [value, selected]);

  const selectedLabel = selected ? buildPantalonLabel(selected) : null;
  const isQueryLockedToSelection =
    value != null &&
    selectedLabel != null &&
    query.trim() === selectedLabel.trim();

  const debouncedNorm = debouncedSearch.trim().toLowerCase();
  const hasMinSearch = debouncedNorm.length >= 1;

  const filtered = useMemo(() => {
    if (debouncedNorm.length < 1) return [];
    return options.filter((p) => matchesPantalonSearch(p, debouncedNorm));
  }, [options, debouncedNorm]);

  const canShowDropdown =
    hasMinSearch &&
    !isLoading &&
    options.length > 0 &&
    !isQueryLockedToSelection;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-end gap-2">
        <Input
          label="Pantalón (opcional)"
          placeholder="Solo pantalones disponibles para la fecha seleccionada"
          value={query}
          isDisabled={isDisabled}
          aria-label="Buscador opcional de pantalón"
          className="flex-1"
          onValueChange={(next) => {
            setQuery(next);
            if (next.trim() === "") {
              onChange(undefined);
              return;
            }
            if (value != null && selected) {
              const label = buildPantalonLabel(selected);
              if (next !== label) {
                onChange(undefined);
              }
            }
          }}
        />
        <Button
          variant="flat"
          isDisabled={isDisabled || (!query.trim() && value == null)}
          onPress={() => {
            setQuery("");
            onChange(undefined);
          }}
        >
          Limpiar
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-10 items-center">
          <Spinner size="sm" color="secondary" />
        </div>
      ) : options.length === 0 ? null : canShowDropdown &&
        filtered.length > 0 ? (
        <div className="max-h-44 overflow-auto rounded-lg border border-pastel-border bg-pastel-soft p-1">
          {filtered.map((pantalon) => (
            <button
              key={pantalon.id}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                onChange(pantalon.id);
                setQuery(buildPantalonLabel(pantalon));
              }}
              className={`block w-full rounded px-3 py-2 text-left text-sm hover:bg-white/70 disabled:opacity-50 ${
                value === pantalon.id
                  ? "bg-white/80 font-medium text-pastel-primary"
                  : "text-pastel-text"
              }`}
            >
              {buildPantalonLabel(pantalon)}
            </button>
          ))}
        </div>
      ) : canShowDropdown && filtered.length === 0 ? (
        <p className="text-xs text-pastel-text/70">
          No hay pantalones que coincidan con la búsqueda.
        </p>
      ) : null}
    </div>
  );
}
