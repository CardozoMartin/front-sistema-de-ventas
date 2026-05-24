import { useState } from "react";
import { Scale } from "lucide-react";
import {
  pricePer100gFromKg,
  pricePerKgFrom100g,
  saleTotalFromWeight,
} from "../../utils/weightSale";

interface WeightProductPricingHelperProps {
  pricePerKg: number;
  onPricePerKgChange: (value: number) => void;
}

/**
 * Ayuda a cargar el precio por kg cuando en el negocio se piensa en "cada 100 g".
 * No guarda nada extra: solo calcula el $/kg que usa el sistema.
 */
const WeightProductPricingHelper = ({
  pricePerKg,
  onPricePerKgChange,
}: WeightProductPricingHelperProps) => {
  const [per100gEditing, setPer100gEditing] = useState("");

  // Muestra el valor siendo editado, o el valor derivado del pricePerKg
  const per100gValue =
    per100gEditing ||
    (pricePerKg > 0 ? String(pricePer100gFromKg(pricePerKg)) : "");

  const handle100gChange = (raw: string) => {
    setPer100gEditing(raw);
    const n = parseFloat(raw);
    if (!isNaN(n) && n > 0) {
      onPricePerKgChange(parseFloat(pricePerKgFrom100g(n).toFixed(2)));
    }
  };

  const handleBlur = () => {
    setPer100gEditing("");
  };

  const exampleKg = 0.15;
  const exampleTotal =
    pricePerKg > 0 ? saleTotalFromWeight(pricePerKg, exampleKg) : 0;

  return (
    <div className="rounded-lg border border-indigo-200 bg-neutral-100/80 p-4 space-y-3 text-sm">
      <p className="font-semibold text-indigo-900 flex items-center gap-2">
        <Scale size={16} />
        Venta por peso (el sistema prorratea solo)
      </p>
      <p className="text-indigo-800 text-xs leading-relaxed">
        Elegí <strong>Kilogramo</strong> y cargá el precio <strong>por kg</strong>. En caja el
        vendedor pesa en gramos (100 g, 150 g, etc.) y el total se calcula solo:{" "}
        <strong>kg × precio/kg</strong>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-medium text-indigo-900 mb-1">
            Si tu etiqueta dice precio cada 100 g (ayuda)
          </label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={per100gValue}
              onChange={(e) => handle100gChange(e.target.value)}
              onBlur={handleBlur}
              className="w-full border border-indigo-300 rounded-md pl-6 pr-2 py-1.5 text-sm bg-white"
              placeholder="Ej: 1500"
            />
          </div>
          <p className="text-[10px] text-neutral-700 mt-1">
            Completa solo esto o el precio por kg; se sincronizan.
          </p>
        </div>
        <div className="bg-white/70 rounded-md p-2 border border-indigo-100 text-xs text-indigo-900">
          <p>
            <strong>Ejemplo venta 150 g:</strong>
          </p>
          <p className="mt-1 font-mono">
            0,15 kg × ${pricePerKg > 0 ? pricePerKg.toLocaleString("es-AR") : "?"} /kg
          </p>
          <p className="mt-1 font-bold text-neutral-700">
            = ${exampleTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeightProductPricingHelper;
