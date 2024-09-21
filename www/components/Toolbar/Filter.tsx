import { useImageStore, useFilterStore } from "@/store/store";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Dispatch, SetStateAction } from "react";

export const Filter = ({
  Redraw,
  MenuOpen,
}: {
  Redraw: (reposition: Boolean) => void;
  MenuOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { getWasmImg } = useImageStore();
  const { setFilter, filters } = useFilterStore();
  const image = getWasmImg();

  const applyFilters = () => {
    const filterData = Object.entries(filters)
      .filter(([_, value]) => value !== 0)
      .map(([name, value]) => [name, value / 100]);
    image.apply_filters(JSON.stringify(filterData));
    Redraw(false);
  };

  const handleFilterChange = (filterName: string) => (value: any) => {
    setFilter(filterName, value[0]);
    applyFilters();
  };

  return (
    <div className="flex top-[200px] left-0 absolute flex-col gap-2 p-3 bg-neutral-900 rounded-md border-[1px] border-neutral-700">
      {Object.entries(filters).map(([filterName, value]) => (
        filterName != "invert" &&
        <div key={filterName}>
          <p className="text-sm capitalize">{filterName}</p>
          <Slider
            onValueChange={handleFilterChange(filterName)}
            min={
              filterName === "grayscale" || filterName === "sepia" ? 0 : -100
            }
            max={100}
            step={1}
            className="w-64 mb-4 mt-2"
            defaultValue={[value]}
            value={[value]}
          />
        </div>
      ))}
      <div className="flex mb-3 items-center gap-3">
        <Switch
          checked={filters.invert == 0}
          onCheckedChange={() => {
            if (filters.invert == 1) {
              setFilter("invert", 0);
            } else {
              setFilter("invert", 1);
            }

            applyFilters();
            image.apply_change();
            image.update_orig();
          }}
        />
        <p className="text-neutral-400 text-xs">Invert Image</p>
      </div>
      <Button
        onClick={() => {
          image.apply_change();
          image.update_orig();
          MenuOpen(false);
        }}
        className="w-64"
      >
        Apply
      </Button>
    </div>
  );
};
