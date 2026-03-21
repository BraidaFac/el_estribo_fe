"use client";

import { Saco } from "@/lib/domain/reservas/types";
import { listarSacos } from "@/lib/services/v2";
import { Button, Input, Spinner } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type SacoFilterInputProps = {
  value: number | null;
  onSelect: (sacoId: number | null) => void;
  onSelectedSacoChange?: (saco: Saco | null) => void;
};

function buildSacoLabel(saco: Saco): string {
  return `${saco.codigo} - ${saco.marca}${saco.talle ? ` - Talle ${saco.talle}` : ""}`;
}

export function SacoFilterInput({
  value,
  onSelect,
  onSelectedSacoChange,
}: SacoFilterInputProps) {
  const [catalogo, setCatalogo] = useState<Saco[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setCatalogo(await listarSacos());
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el catalogo de sacos",
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const selectedSaco = useMemo(
    () => catalogo.find((saco) => saco.id === value) ?? null,
    [catalogo, value],
  );

  useEffect(() => {
    onSelectedSacoChange?.(selectedSaco);
  }, [onSelectedSacoChange, selectedSaco]);

  const canSearch = query.trim().length >= 2;

  const filtered = useMemo(() => {
    if (!canSearch) return [];
    const normalized = query.trim().toLowerCase();
    return catalogo
      .filter((saco) =>
        `${saco.codigo} ${saco.marca} ${saco.talle ?? ""} ${buildSacoLabel(saco)}`
          .toLowerCase()
          .includes(normalized),
      )
      .slice(0, 12);
  }, [canSearch, catalogo, query]);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <Input
          label="Buscar saco por codigo o marca"
          value={query}
          onValueChange={(next) => {
            setQuery(next);
            if (!next.trim()) {
              onSelect(null);
            }
          }}
          className="max-w-xl"
        />
        <Button
          variant="flat"
          onPress={() => {
            setQuery("");
            onSelect(null);
          }}
        >
          Limpiar
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-10 items-center">
          <Spinner size="sm" color="secondary" />
        </div>
      ) : !canSearch ? (
        <p className="text-xs text-pastel-text/70">
          Escribe al menos 2 letras para buscar por codigo o marca.
        </p>
      ) : filtered.length > 0 ? (
        <div className="max-h-44 overflow-auto rounded-lg border border-pastel-border bg-pastel-soft p-1">
          {filtered.map((saco) => (
            <button
              key={saco.id}
              type="button"
              onClick={() => {
                onSelect(saco.id);
                setQuery(buildSacoLabel(saco));
              }}
              className={`block w-full rounded px-3 py-2 text-left text-sm hover:bg-white/70 ${
                value === saco.id ? "bg-white/80 font-medium text-pastel-primary" : "text-pastel-text"
              }`}
            >
              {buildSacoLabel(saco)}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-pastel-text/70">
          No se encontraron sacos para ese criterio.
        </p>
      )}
    </div>
  );
}
