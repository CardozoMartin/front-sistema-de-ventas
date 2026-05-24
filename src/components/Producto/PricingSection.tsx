import { AlertCircle, DollarSign, ShoppingCart } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { formatCurrency } from "../../utils/formatCurrency";

interface PricingSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  unitType: "unidad" | "kilogramo";
  margin: string | null;
  pricingPreview: any;
}

export const PricingSection = ({
  register,
  errors,
  unitType,
  margin,
  pricingPreview,
}: PricingSectionProps) => {
  return (
    <section className="bg-slate-50/50 rounded-lg p-6 border border-slate-100 space-y-5">
      <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-slate-400" />
        Precios
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Precio de venta */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            Precio de venta <span className="text-rose-500">*</span>
            {unitType === "kilogramo" && (
              <span className="ml-1 text-[10px] font-normal text-indigo-500 normal-case tracking-normal">
                ($ por kg)
              </span>
            )}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
              $
            </span>
            <input
              {...register("price", {
                required: "El precio de venta es obligatorio",
                validate: (v) => !isNaN(Number(v)) && Number(v) > 0 || "Debe ser mayor a 0",
              })}
              onChange={(e) => {
                e.target.value = e.target.value.replace(",", ".");
                register("price").onChange(e);
              }}
              type="text"
              inputMode="decimal"
              className={`w-full px-4 py-3 bg-white border rounded-md pl-8 focus:outline-none focus:bg-white focus:ring-2 focus:ring-neutral-500/50 transition-all font-medium text-sm ${
                errors.price
                  ? "border-rose-400 focus:ring-rose-500/50"
                  : "border-slate-200"
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.price && (
            <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.price?.message?.toString()}
            </p>
          )}
        </div>

        {/* Precio de costo */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            Precio de costo
            <span className="ml-1 text-[10px] text-slate-400 font-normal normal-case tracking-normal">(opcional)</span>
            {unitType === "kilogramo" && (
              <span className="ml-1 text-[10px] font-normal text-indigo-500 normal-case tracking-normal">
                ($ por kg, no el lote entero)
              </span>
            )}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
              $
            </span>
            <input
              {...register("costPrice", {
                validate: (v) => !v || (!isNaN(Number(v)) && Number(v) >= 0) || "Debe ser 0 o mayor",
              })}
              onChange={(e) => {
                e.target.value = e.target.value.replace(",", ".");
                register("costPrice").onChange(e);
              }}
              type="text"
              inputMode="decimal"
              className={`w-full px-4 py-3 bg-white border rounded-md pl-8 focus:outline-none focus:bg-white focus:ring-2 focus:ring-neutral-500/50 transition-all font-medium text-sm ${
                errors.costPrice
                  ? "border-rose-400 focus:ring-rose-500/50"
                  : "border-slate-200"
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.costPrice && (
            <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.costPrice?.message?.toString()}
            </p>
          )}
        </div>
      </div>

      {/* Margen calculado */}
      {margin !== null && pricingPreview && (
        <div
          className={`flex flex-col gap-1 px-3 py-2 rounded-md text-sm font-medium border ${
            Number(margin) >= 0
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 flex-shrink-0" />
            Margen: <span className="font-bold">{margin}%</span>
            {unitType === "kilogramo" && pricingPreview.profitPerUnit > 0 && (
              <span className="text-xs">(ganancia/kg: {formatCurrency(pricingPreview.profitPerUnit)})</span>
            )}
          </div>
          {pricingPreview.hint && (
            <p className="text-xs text-blue-800 font-normal">{pricingPreview.hint}</p>
          )}
          {Number(margin) < 0 && (
            <span className="text-xs font-normal">
              Vendés por debajo del costo{unitType === "kilogramo" ? " por kg" : ""}
            </span>
          )}
        </div>
      )}
    </section>
  );
};
