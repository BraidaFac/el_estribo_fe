"use client";
import { Button, Input } from "@heroui/react";
import { useEffect, useState } from "react";

const Filter = ({
  filter,
  onFilterChange,
  onClearFilter,
}: {
  filter: { dateString: string; suit: string };
  onFilterChange: (filter: { dateString: string; suit: string }) => void;
  onClearFilter: () => void;
}) => {
  const [filterState, setFilterState] = useState(filter);

  useEffect(() => {
    setFilterState(filter);
  }, [filter]);
  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <Input
          size="sm"
          type="text"
          id="input_sidebar"
          label="Buscar traje"
          labelPlacement="outside"
          placeholder="Ej: A401"
          value={filterState.suit}
          onChange={(e) => setFilterState({ ...filterState, suit: e.target.value })}
          className="w-full md:w-44"
        />

        <Input
          id="input_date_sidebar"
          type="date"
          size="sm"
          label="Disponibilidad"
          labelPlacement="outside"
          value={filterState.dateString}
          onChange={(e) => setFilterState({ ...filterState, dateString: e.target.value })}
          className="w-fullmd:w-44"
        />

        <Button
          type="button"
          size="sm"
          color="warning"
          onPress={() => onFilterChange(filterState)}
          className="bg-pastel-accent/80 text-pastel-text font-semibold"
          isDisabled={!filterState.dateString && !filterState.suit}
        >
          Buscar
        </Button>
        <Button
          type="button"
          size="sm"
          variant="bordered"
          onPress={onClearFilter}
          className="min-w-8 w-8 px-0 border-pastel-border text-pastel-text font-semibold"
          isDisabled={!filterState.dateString && !filterState.suit}
          aria-label="Limpiar filtro"
        >
          ×
        </Button>
      </div>
      <p className="mt-2 text-xs text-pastel-text/70">
        Filtra por nombre o busca trajes libres por fecha.
      </p>
    </>
  );
};

export default Filter;
