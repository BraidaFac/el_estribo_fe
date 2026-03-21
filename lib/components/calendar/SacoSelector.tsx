"use client";

import { Saco } from "@/lib/domain/reservas/types";
import { listarSacos } from "@/lib/services/v2";
import { Select, SelectItem, Spinner } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "el_estribo_recent_saco_ids";

type SacoSelectorProps = {
  value: number | null;
  onSelect: (sacoId: number) => void;
};

export function SacoSelector({ value, onSelect }: SacoSelectorProps) {
  const [input, setInput] = useState(value ? String(value) : "");
  const [catalogo, setCatalogo] = useState<Saco[]>([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [recentIds, setRecentIds] = useState<number[]>([]);
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsCatalogLoading(true);
        setCatalogo(await listarSacos());
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el catalogo de sacos",
        );
      } finally {
        setIsCatalogLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as number[];
      setRecentIds(parsed.filter((id) => Number.isFinite(id) && id > 0).slice(0, 8));
    } catch {
      setRecentIds([]);
    }
  }, []);

  const isValid = useMemo(() => {
    if (!input.trim()) return false;
    const id = Number(input);
    return Number.isInteger(id) && id > 0;
  }, [input]);

  const persistRecentId = (id: number) => {
    const next = [id, ...recentIds.filter((x) => x !== id)].slice(0, 8);
    setRecentIds(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  const selectedKeys = value ? [String(value)] : [];

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 md:flex-row md:items-end">
        {isCatalogLoading ? (
          <div className="flex h-12 items-center">
            <Spinner size="sm" color="secondary" />
          </div>
        ) : (
          <Select
            label="Saco"
            placeholder="Selecciona un saco"
            className="max-w-lg"
            selectedKeys={selectedKeys}
            onSelectionChange={(keys) => {
              const first = Array.from(keys)[0];
              if (!first) return;
              const id = Number(first);
              setInput(String(id));
              setInputError(null);
              onSelect(id);
              persistRecentId(id);
            }}
          >
            {catalogo.map((saco) => (
              <SelectItem key={String(saco.id)}>
                {`${saco.codigo} - ${saco.marca}${saco.talle ? ` - Talle ${saco.talle}` : ""}`}
              </SelectItem>
            ))}
          </Select>
        )}
      </div>
    </div>
  );
}
