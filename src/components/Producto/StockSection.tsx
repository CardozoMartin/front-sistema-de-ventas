import { AlertCircle, Ruler } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";

interface StockSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  unitType: "unidad" | "kilogramo";
  stock: number;
  stockDisplay: string | null;
  productEdite: any;
  UNIT_TYPES: { value: "unidad" | "kilogramo"; label: string; icon: string; hint: string }[];
}

export const StockSection = ({
  register,
  errors,
  unitType,
  stock,
  stockDisplay,
  productEdite,
  UNIT_TYPES,
}: StockSectionProps) => {
  return (
    <section className="bg-slate-50/50 rounded-lg p-6 border border-slate-100 space-y-5">
      <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
        <Ruler className="w-5 h-5 text-slate-400" />
        Inventario
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Unidad de medida */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Unidad de medida
          </label>
          <div className="flex gap-3">
            {UNIT_TYPES.map((unit) => (
              <label
                key={unit.value}
                className={`relative flex-1 flex flex-col items-center gap-1.5 p-4 border rounded-md cursor-pointer transition-all ${
                  unitType === unit.value
                    ? "border-sky-500 bg-neutral-50 ring-2 ring-sky-500/20 text-sky-900"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <input
                  {...register("unitType")}
                  type="radio"
                  value={unit.value}
                  className="sr-only"
                />
                <span className="text-2xl">{unit.icon}</span>
                <span className="font-bold text-sm">{unit.label}</span>
              </label>
            ))}
          </div>
          {unitType && (
            <p className="text-[11px] text-slate-500 mt-2.5 px-1 font-medium">
              💡 {UNIT_TYPES.find((u) => u.value === unitType)?.hint}
            </p>
          )}
        </div>

        {/* Stock */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>{productEdite ? "Stock actual" : "Stock inicial"}</span>
            <span className="text-rose-500">*</span>
            {unitType && (
              <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded-sm font-bold text-[10px] ml-1">
                {unitType === "kilogramo" ? "kg" : "uds"}
              </span>
            )}
          </label>
          <input
            {...register("stock", {
              required: "El stock es obligatorio",
              validate: (v) => !isNaN(Number(v)) && Number(v) >= 0 || "Debe ser 0 o mayor",
            })}
            onChange={(e) => {
              e.target.value = e.target.value.replace(",", ".");
              register("stock").onChange(e);
            }}
            type="text"
            inputMode="decimal"
            className={`w-full px-4 py-3 bg-white border rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-neutral-500/50 transition-all font-medium text-sm ${
              errors.stock
                ? "border-rose-400 focus:ring-rose-500/50"
                : "border-slate-200"
            }`}
            placeholder={unitType === "kilogramo" ? "Ej: 2.5" : "Ej: 10"}
          />
          {errors.stock && (
            <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.stock?.message?.toString()}
            </p>
          )}
          {/* Conversión en tiempo real para kg */}
          {stockDisplay && (
            <p className="flex items-center gap-1.5 text-xs text-accent-700 mt-2 p-2 bg-accent-50 border border-accent-200 rounded font-medium">
              🔄 {stock} kg {stockDisplay}
            </p>
          )}
          {productEdite && (
            <p className="text-xs text-amber-800 mt-1.5 p-2 bg-amber-50 border border-amber-100 rounded">
              ⚠️ Modificá solo si necesitás ajustar el stock manualmente
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
