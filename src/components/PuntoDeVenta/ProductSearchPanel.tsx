import { Search, Tag, Scale } from "lucide-react";
import type { Product } from "../../services/types";
import type { Promotion } from "../../services/promotions.service";
import WeightVolumeInput from "../Cart/WeightVolumeInput";
import { pricePer100gFromKg } from "../../utils/weightSale";
import { formatCurrency } from "../../utils/formatCurrency";

interface ProductSearchPanelProps {
  searchInputRef: React.RefObject<HTMLInputElement>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setScanCode: (code: string) => void;
  filteredProducts: any[];
  selectedProductForWeight: Product | null;
  loadingProducts: boolean;
  handleSelectProductForWeight: (item: any) => void;
  weightInputType: "cantidad" | "monto";
  weightInputValue: string;
  weightPreview: any;
  setWeightInputType: (type: "cantidad" | "monto") => void;
  setWeightInputValue: (val: string) => void;
  handleCancelWeightProduct: () => void;
  handleConfirmWeightProduct: () => void;
  handleSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const CatalogEmptyState = ({
  searchTerm,
  icon: Icon = Search,
  title,
  description,
}: {
  searchTerm: string;
  icon?: typeof Search;
  title?: string;
  description?: string;
}) => (
  <div className="flex min-h-[220px] flex-col items-center justify-center py-8 text-center">
    <Icon className="mb-3 h-8 w-8 text-neutral-300" strokeWidth={1.5} />
    <p className="text-sm font-medium text-neutral-700">
      {title ?? (searchTerm ? "Sin resultados" : "Listo para buscar")}
    </p>
    <p className="mt-1 max-w-xs text-xs text-neutral-500">
      {description ??
        (searchTerm
          ? "Probá con otro término o código."
          : "Escaneá o escribí para comenzar la venta.")}
    </p>
  </div>
);

export const ProductSearchPanel = ({
  searchInputRef,
  searchTerm,
  setSearchTerm,
  setScanCode,
  filteredProducts,
  selectedProductForWeight,
  loadingProducts,
  handleSelectProductForWeight,
  weightInputType,
  weightInputValue,
  weightPreview,
  setWeightInputType,
  setWeightInputValue,
  handleCancelWeightProduct,
  handleConfirmWeightProduct,
  handleSearchKeyDown,
}: ProductSearchPanelProps) => {
  const showResults = !selectedProductForWeight && !loadingProducts && filteredProducts.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 max-lg:max-h-[52vh] max-lg:min-h-[52vh] lg:col-span-2">
      {/* Barra de búsqueda: altura fija */}
      <div className="app-card shrink-0 p-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
            strokeWidth={1.75}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar por nombre, código o escanear..."
            className="app-input py-2.5 pl-9 text-base"
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              setScanCode(value);
            }}
            onKeyDown={handleSearchKeyDown}
            disabled={loadingProducts || selectedProductForWeight !== null}
          />
        </div>
      </div>

      {/* Catálogo: ocupa el resto; solo hace scroll el contenido interno */}
      <div className="app-card relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Panel de peso en overlay — no empuja el layout */}
        {selectedProductForWeight && (
          <div className="absolute inset-0 z-20 flex flex-col overflow-hidden bg-white">
            <div className="shrink-0 border-b border-neutral-200 bg-accent-50/40 px-4 py-3">
              <h3 className="text-base font-semibold text-neutral-900">
                {selectedProductForWeight.name}
              </h3>
              <p className="mt-1 text-sm text-neutral-600">
                {formatCurrency(selectedProductForWeight.price)} / kg
                <span className="ml-2 text-neutral-500">
                  ({formatCurrency(pricePer100gFromKg(selectedProductForWeight.price))} / 100 g)
                </span>
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <WeightVolumeInput
                inputType={weightInputType}
                inputValue={weightInputValue}
                productPreview={weightPreview}
                productName={selectedProductForWeight.name}
                onInputTypeChange={setWeightInputType}
                onInputValueChange={setWeightInputValue}
                onCancel={handleCancelWeightProduct}
                onConfirm={handleConfirmWeightProduct}
              />
            </div>
          </div>
        )}

        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3">
          <h3 className="section-title">Catálogo</h3>
          <span className="badge-neutral tabular-nums">
            {selectedProductForWeight
              ? "Modo peso"
              : searchTerm.trim()
                ? `${filteredProducts.length} resultado${filteredProducts.length !== 1 ? "s" : ""}`
                : "—"}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
          {loadingProducts ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center py-8">
              <div className="spinner" />
              <p className="mt-3 text-sm text-neutral-500">Cargando catálogo...</p>
            </div>
          ) : showResults ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {filteredProducts.map((item) => {
                const isPromotion = item.isPromotion === true;

                if (isPromotion) {
                  const promo = item as Promotion;
                  return (
                    <button
                      key={`promo-${promo.id}`}
                      type="button"
                      onClick={() => handleSelectProductForWeight(item)}
                      className="flex flex-col rounded-lg border border-neutral-300 bg-neutral-50 p-3 text-left transition-colors hover:border-neutral-400 hover:bg-white"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <span className="badge-neutral inline-flex items-center gap-1">
                          <Tag size={10} />
                          Promo
                        </span>
                        <span className="price-display text-base">
                          {formatCurrency(promo.promoPrice)}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-neutral-900">{promo.name}</h4>
                      {promo.discountPercentage > 0 && (
                        <p className="mt-1 text-xs text-neutral-500">
                          −{promo.discountPercentage.toFixed(0)}% · Reg.{" "}
                          {formatCurrency(promo.originalPrice)}
                        </p>
                      )}
                      <ul className="mt-2 space-y-0.5 border-t border-neutral-200 pt-2 text-xs text-neutral-600">
                        {promo.items.map((promoItem, idx) => (
                          <li key={idx}>
                            {promoItem.quantity}× {promoItem.snapshotName}
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                }

                const product = item as Product;
                return (
                  <button
                    key={`prod-${product.id}`}
                    type="button"
                    onClick={() => handleSelectProductForWeight(product)}
                    className="flex flex-col rounded-lg border border-neutral-200 bg-white p-3 text-left transition-colors hover:border-neutral-300 hover:bg-neutral-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium leading-snug text-neutral-900">
                        {product.name}
                      </h4>
                      <span className="price-display shrink-0 text-base">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {product.category && (
                        <span className="badge-neutral">{product.category}</span>
                      )}
                      <span className="badge-neutral">
                        {product.unitType === "kilogramo" ? "Por kg" : "Por unidad"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2 text-xs text-neutral-500">
                      <span>
                        Stock:{" "}
                        <span className="font-medium text-neutral-700">{product.stock}</span>
                      </span>
                      {product.unitType === "kilogramo" ? (
                        <span className="inline-flex items-center gap-1 text-neutral-600">
                          <Scale size={12} />
                          Pesar
                        </span>
                      ) : (
                        <span className="text-neutral-400">Agregar</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <CatalogEmptyState searchTerm={searchTerm} />
          )}
        </div>
      </div>
    </div>
  );
};
