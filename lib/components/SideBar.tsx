"use client";
import { useSuits } from "@/app/trajes/hooks/useSuits";
import {
  Button,
  Listbox,
  ListboxItem,
  ListboxSection,
  Spinner
} from "@heroui/react";
import { useEffect, useState } from "react";
import { Suit } from "../utils/suit";
import { useAppContext } from "./AppContext";
import Filter from "./Filter";
import { ListboxWrapper } from "./ListboxWrapper";

const SideBar = () => {
  const { suit, setSuit, suits, isLoading } = useAppContext();
  const { fetchFreeSuits } = useSuits();
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [filter, setFilter] = useState({ dateString: "", suit: "" });
  const [isPinned, setIsPinned] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const isDrawerOpen = isPinned || isHovering;

  const [visibleSuits, setVisibleSuits] = useState<Suit[]>([]);

  useEffect(() => {
    if (!filter.dateString && !filter.suit) {
      setVisibleSuits(suits);
      return;
    };

    (async () => {
      const data = await fetchFreeSuits(filter);
      setVisibleSuits(data);
    })();
  }, [fetchFreeSuits, filter, suits]);

  const handleSuitSelect = (selectedSuit: Suit) => {
    setSelectedValue(selectedSuit.id);
    setSuit(selectedSuit);
  };

  const handleDrawerToggle = () => {
    setIsPinned((prev) => !prev);
  };

  const handleApplyFilter = (nextFilter: { dateString: string; suit: string }) => {
    setFilter(nextFilter);
  };

  const handleClearFilter = () => {
    setFilter({ dateString: "", suit: "" }); 
  };

  useEffect(() => {
    if (!selectedValue && suit?.id) {
      setSelectedValue(suit.id);
    }
  }, [selectedValue, suit?.id]);

  return (
    <>
      <aside
        id="sidebar"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`fixed left-0 top-20 md:top-26 z-50 h-[calc(100dvh-5rem)] md:h-[calc(100dvh-8rem)] w-[clamp(260px,33vw,420px)] rounded-r-xl border border-pastel-border bg-pastel-surface/95 shadow-lg transition-transform duration-300 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-[calc(-100%+14px)]" 
        }`}
      >
        {!isDrawerOpen && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 rounded-l-md bg-pastel-primary px-1 py-4 text-xs font-semibold text-white">
            <div className="flex flex-col">
              <p>T</p>
              <p>R</p>
              <p>A</p>
              <p>J</p>
              <p>E</p>
              <p>S</p>
            </div>
          </div>
        )}

        <div className="h-full p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-pastel-text">Trajes</h2>
            <Button
              size="sm"
              variant={isPinned ? "solid" : "bordered"}
              color={isPinned ? "primary" : "default"}
              onPress={handleDrawerToggle}
              className="text-pastel-text border-pastel-border"
            >
              {isPinned ? "Desanclar" : "Anclar"}
            </Button>
          </div>

          <Filter
            filter={filter}
            onFilterChange={handleApplyFilter}
            onClearFilter={handleClearFilter}
          />

          {isLoading ? (
            <div className="pt-6 text-center">
              <Spinner color="secondary" />
            </div>
          ) : (
            <ListboxWrapper>
              <Listbox variant="flat" selectionMode="single" selectedKeys={selectedValue ? [selectedValue] : []}>
                  <ListboxSection>
                    {visibleSuits.length === 0 ? (
                      <ListboxItem
                        className="border-b border-pastel-border text-pastel-text ">
                        <span className="text-sm">No se encontraron trajes libres</span>
                      </ListboxItem>
                    ) : (
                      visibleSuits.map((item) => (
                    <ListboxItem
                      key={item.id}
                      className="border-b border-pastel-border text-pastel-text"
                      onPress={() => handleSuitSelect(item)}
                    >
                      <span className="text-sm">{item.id}</span>
                    </ListboxItem>
                  )))}
                </ListboxSection>
              </Listbox>
            </ListboxWrapper>
          )}
        </div>
      </aside>
    </>
  );
};

export default SideBar;
