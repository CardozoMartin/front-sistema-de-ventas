import { AlertTriangle, Package } from "lucide-react";

export type StockFilterType = "all" | "no-stock" | "low-stock";

interface StockFilterProps {
  activeFilter: StockFilterType;
  onFilterChange: (filter: StockFilterType) => void;
  counts?: {
    total: number;
    noStock: number;
    lowStock: number;
  };
}

const filterBtn = (active: boolean) =>
  active
    ? "border-neutral-900 bg-neutral-900 text-white"
    : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50";

const StockFilter = ({ activeFilter, onFilterChange, counts }: StockFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onFilterChange("all")}
        className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${filterBtn(activeFilter === "all")}`}
      >
        <Package className="h-4 w-4 text-neutral-400" />
        Todos
        {counts != null && <span className="text-xs opacity-80">({counts.total})</span>}
      </button>

      <button
        type="button"
        onClick={() => onFilterChange("low-stock")}
        className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
          activeFilter === "low-stock"
            ? "border-amber-600 bg-amber-50 text-amber-900"
            : "border-neutral-200 bg-white text-neutral-600 hover:border-amber-300 hover:bg-amber-50/50 hover:text-amber-800"
        }`}
      >
        <AlertTriangle className={`h-4 w-4 ${activeFilter === "low-stock" ? "text-amber-700" : "text-amber-500"}`} />
        Poco stock
        {counts != null && <span className="text-xs opacity-80">({counts.lowStock})</span>}
      </button>

      <button
        type="button"
        onClick={() => onFilterChange("no-stock")}
        className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
          activeFilter === "no-stock"
            ? "border-red-600 bg-red-50 text-red-900"
            : "border-neutral-200 bg-white text-neutral-600 hover:border-red-300 hover:bg-red-50/50 hover:text-red-700"
        }`}
      >
        <AlertTriangle className={`h-4 w-4 ${activeFilter === "no-stock" ? "text-red-700" : "text-red-500"}`} />
        Sin stock
        {counts != null && <span className="text-xs opacity-80">({counts.noStock})</span>}
      </button>
    </div>
  );
};

export default StockFilter;
