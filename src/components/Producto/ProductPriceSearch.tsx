import { useEffect, useMemo, useState } from "react";
import { Search, AlertTriangle, TrendingDown, TrendingUp, Scale } from "lucide-react";
import { useSearchProductsByQuery, useAllProductsNoPagination } from "../../hooks";
import type { Product } from "../../services/types";
import { analyzeProductPricing } from "../../utils/productPricing";
import { formatStockDisplay } from "../../utils/formatQuantity";
import { formatCurrency } from "../../utils/formatCurrency";

function productCode(product: Product): string {
  return product.code || product.barcode || "—";
}

const ProductPriceSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [onlyLoss, setOnlyLoss] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(searchTerm.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const canSearch = debouncedTerm.length >= 2;

  const { data: searchResults, isLoading: searching } = useSearchProductsByQuery(
    debouncedTerm,
    canSearch
  );
  const { data: allProducts, isLoading: loadingAll } = useAllProductsNoPagination();

  const displayProducts = useMemo(() => {
    let list: Product[] = [];

    if (canSearch) {
      list = searchResults ?? [];
    } else if (onlyLoss) {
      list = allProducts ?? [];
    } else {
      return [];
    }

    if (onlyLoss) {
      list = list.filter((p) => analyzeProductPricing(p).sellsAtLoss);
    }

    return [...list].sort((a, b) => {
      const lossA = analyzeProductPricing(a).profitPerUnit;
      const lossB = analyzeProductPricing(b).profitPerUnit;
      return lossA - lossB;
    });
  }, [canSearch, searchResults, allProducts, onlyLoss]);

  const lossCount = useMemo(
    () => (allProducts ?? []).filter((p) => analyzeProductPricing(p).sellsAtLoss).length,
    [allProducts]
  );

  const isLoading = (canSearch && searching) || (onlyLoss && !canSearch && loadingAll);
  const showEmptyHint = !canSearch && !onlyLoss;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <Search size={22} className="text-neutral-600" />
          Consultar precios y costos
        </h3>
        <p className="text-sm text-slate-500 mt-2 font-medium">
          Productos por <strong>kg</strong>: precio y costo siempre en <strong>$/kg</strong>.
          Si cargaste el costo del lote entero, el sistema lo estima dividiendo por el stock en kg.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nombre, código o descripción (mín. 2 caracteres)..."
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-md bg-slate-50 focus:bg-white focus:ring-2 focus:ring-neutral-500/50 focus:border-sky-500 transition-all font-medium text-slate-700"
          />
        </div>
        <label className="flex items-center gap-3 px-5 py-3 bg-amber-50/50 border border-amber-200 rounded-md cursor-pointer shrink-0 hover:bg-amber-50 transition-colors">
          <input
            type="checkbox"
            checked={onlyLoss}
            onChange={(e) => setOnlyLoss(e.target.checked)}
            className="w-5 h-5 rounded border-amber-300 text-amber-500 focus:ring-amber-500/50"
          />
          <span className="text-sm font-bold text-amber-800 whitespace-nowrap">
            Solo con pérdida real
          </span>
        </label>
      </div>

      {!loadingAll && lossCount > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-100 border border-amber-300 px-3 py-2 text-sm text-amber-900">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>
            Hay <strong>{lossCount}</strong> producto{lossCount !== 1 ? "s" : ""} con costo por
            unidad mayor al precio de venta (ya considerando productos por kg).
          </span>
        </div>
      )}

      {showEmptyHint && (
        <p className="text-sm text-gray-500 text-center py-6 bg-white/60 rounded-lg border border-dashed border-gray-300">
          Escribí al menos 2 caracteres para buscar, o marcá &quot;Solo con pérdida real&quot; para
          listar productos problemáticos.
        </p>
      )}

      {isLoading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-neutral-900" />
        </div>
      )}

      {!isLoading && !showEmptyHint && displayProducts.length === 0 && (
        <p className="text-center text-gray-600 py-8 bg-white rounded-lg border border-gray-200">
          No hay productos que coincidan con la búsqueda
          {onlyLoss ? " y el filtro de pérdida" : ""}.
        </p>
      )}

      {!isLoading && displayProducts.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-slate-100 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Producto</th>
                <th className="px-5 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Unidad</th>
                <th className="px-5 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs">Stock</th>
                <th className="px-5 py-4 text-right font-bold text-slate-600 uppercase tracking-wider text-xs">Precio venta</th>
                <th className="px-5 py-4 text-right font-bold text-slate-600 uppercase tracking-wider text-xs">Costo</th>
                <th className="px-5 py-4 text-right font-bold text-slate-600 uppercase tracking-wider text-xs">Ganancia</th>
                <th className="px-5 py-4 text-right font-bold text-slate-600 uppercase tracking-wider text-xs">Margen</th>
                <th className="px-5 py-4 text-center font-bold text-slate-600 uppercase tracking-wider text-xs">Estado</th>
              </tr>
            </thead>
            <tbody>
              {displayProducts.map((product) => {
                const m = analyzeProductPricing(product);
                return (
                  <tr
                    key={product.id}
                    className={`border-b border-slate-50 transition-colors ${
                      m.sellsAtLoss ? "bg-rose-50/30 hover:bg-rose-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{productCode(product)}</p>
                      {m.hint && (
                        <p className="text-xs font-medium text-neutral-800 mt-1 max-w-xs">{m.hint}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {m.isWeight ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-neutral-100 px-2.5 py-1 rounded-lg">
                          <Scale size={14} />
                          Por kg
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-500">Por unidad</span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-600">
                      {formatStockDisplay(product.stock, product.unitType)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="font-bold text-neutral-800">
                        {formatCurrency(m.saleUnitPrice)}
                      </p>
                      <span className="block text-[10px] font-semibold text-neutral-600/80 mt-0.5">
                        {m.priceSuffix}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="font-bold text-slate-600">
                        {formatCurrency(m.costUnitPrice)}
                      </p>
                      <span className="block text-[10px] font-semibold text-amber-500/80 mt-0.5">
                        {m.costSuffix}
                        {m.costNormalizedFromStock && " (estim.)"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className={`font-bold ${m.sellsAtLoss ? 'text-rose-600' : 'text-accent-700'}`}>
                        {m.profitPerUnit >= 0 ? "+" : ""}{formatCurrency(m.profitPerUnit)}
                      </p>
                      <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">
                        {m.profitColumnLabel}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          m.sellsAtLoss ? "text-rose-600" : "text-accent-700"
                        }`}
                      >
                        {m.sellsAtLoss ? (
                          <TrendingDown size={14} strokeWidth={3} />
                        ) : (
                          <TrendingUp size={14} strokeWidth={3} />
                        )}
                        {m.marginPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {m.sellsAtLoss ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-700">
                          <AlertTriangle size={14} />
                          Pérdida
                        </span>
                      ) : m.costNormalizedFromStock ? (
                        <span className="inline-flex px-3 py-1 rounded-lg text-xs font-bold bg-neutral-100 text-neutral-800">
                          Revisar costo
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1 rounded-lg text-xs font-bold bg-accent-50 text-accent-700">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-gray-500 px-4 py-2 border-t border-gray-100">
            {displayProducts.length} resultado{displayProducts.length !== 1 ? "s" : ""}
            {onlyLoss ? " con pérdida real por unidad/kg" : ""}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductPriceSearch;
