import { Scale, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { formatCurrency } from "../../utils/formatCurrency";

interface WeightVolumeInputProps {
  inputType: "cantidad" | "monto";
  inputValue: string;
  productPreview: {
    cantidad: number;
    monto: number;
    cantidadFormateada: string;
  } | null;
  productName?: string;
  onInputTypeChange: (type: "cantidad" | "monto") => void;
  onInputValueChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const WeightVolumeInput = ({
  inputType,
  inputValue,
  productPreview,
  productName,
  onInputTypeChange,
  onInputValueChange,
  onCancel,
  onConfirm,
}: WeightVolumeInputProps) => {
  const [displayValue, setDisplayValue] = useState("");

  // Limpiar el valor al cambiar de tipo de entrada
  useEffect(() => {
    setDisplayValue("");
    onInputValueChange("");
  }, [inputType]);

  // Formatea el valor ingresado según el tipo de input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ""); // Solo números
    
    if (rawValue === "") {
      setDisplayValue("");
      onInputValueChange("");
      return;
    }

    if (inputType === "cantidad") {
      // Convierte el valor a número y divide por 1000 (gramos a kg)
      const numericValue = parseInt(rawValue, 10);
      const formattedValue = (numericValue / 1000).toFixed(3);
      setDisplayValue(rawValue);
      onInputValueChange(formattedValue);
    } else {
      // Para monto, usa el valor directamente como pesos (sin dividir por 100)
      const numericValue = parseInt(rawValue, 10);
      const formattedValue = numericValue.toString(); // Valor directo en pesos
      setDisplayValue(rawValue);
      onInputValueChange(formattedValue);
    }
  };

  // Formatea el display según el tipo de input
  const formatDisplay = (value: string) => {
    if (!value) return "";
    
    if (inputType === "cantidad") {
      // Asegura que tenga al menos 4 dígitos (000X)
      const padded = value.padStart(4, "0");
      // Inserta el punto: 0600 -> 0.600
      return padded.slice(0, -3) + "." + padded.slice(-3);
    } else {
      // Para monto, muestra el valor directamente sin formato de centavos
      return value;
    }
  };

  // Calcula el precio por kilogramo para mostrar en la balanza
  const calculatedUnitPrice = productPreview && productPreview.cantidad > 0
    ? productPreview.monto / productPreview.cantidad
    : 0;

  return (
    <div className="space-y-4 mt-3 pt-3 border-t border-gray-200">
      {/* Selector de tipo */}
      <div className="flex gap-2">
        <button
          onClick={() => onInputTypeChange("cantidad")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
            inputType === "cantidad"
              ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
              : "bg-white text-gray-700 hover:bg-gray-50 hover:text-neutral-950 border-gray-300"
          }`}
        >
          <Scale size={13} />
          Por Kilogramo
        </button>
        <button
          onClick={() => onInputTypeChange("monto")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
            inputType === "monto"
              ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
              : "bg-white text-gray-700 hover:bg-gray-50 hover:text-neutral-950 border-gray-300"
          }`}
        >
          <DollarSign size={13} />
          Por Dinero
        </button>
      </div>

      {/* Input con formato automático */}
      <div className="relative">
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          {inputType === "cantidad" ? "Ingresa peso en gramos" : "Ingresa monto en pesos"}
        </label>
        <div className="relative rounded-lg shadow-sm">
          <input
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleInputChange}
            placeholder={inputType === "cantidad" ? "Ej: 250 (para 250 gramos)" : "Ej: 1500 (para $1500)"}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-neutral-800 focus:border-neutral-800 outline-none transition-all placeholder:text-gray-400"
            autoFocus
          />
          {displayValue && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-600 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-gray-100">
              {inputType === "cantidad" 
                ? `= ${formatDisplay(displayValue)} kg` 
                : `= $${formatDisplay(displayValue)}`
              }
            </div>
          )}
        </div>
      </div>

      {/* PANTALLA DE BALANZA DIGITAL */}
      <div className="relative overflow-hidden rounded-xl border-2 border-neutral-800 bg-neutral-950 p-4 font-mono shadow-[inset_0_2px_12px_rgba(0,0,0,0.95),0_4px_24px_rgba(0,0,0,0.25)] select-none">
        {/* Glossy glass reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.07] pointer-events-none" />
        
        {/* Header on screen */}
        <div className="flex justify-between items-center text-[10px] tracking-widest text-emerald-500/50 border-b border-emerald-950/80 pb-1.5 mb-3 font-semibold uppercase">
          <span>🖥️ VISOR DE BALANZA</span>
          {productPreview ? (
            <span className="animate-pulse bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-400 font-bold">
              ● ACTIVO
            </span>
          ) : (
            <span className="bg-neutral-900 px-1.5 py-0.5 rounded text-emerald-600/40 font-bold">
              ○ ESPERANDO
            </span>
          )}
        </div>

        {/* Main highlight area */}
        <div className="flex flex-col items-center justify-center py-2 min-h-[72px]">
          {inputType === "monto" ? (
            // Modo por Dinero: Cajero necesita saber cuánto PESO cortar.
            <div className="text-center w-full">
              <span className="text-[9px] text-emerald-500/45 uppercase tracking-widest block font-bold mb-1">
                ⚖️ PESO A ENTREGAR (CORTAR)
              </span>
              {productPreview ? (
                <span className="text-4xl md:text-5xl font-black text-emerald-400 tracking-wider drop-shadow-[0_0_10px_rgba(52,211,153,0.7)] animate-[pulse_2.5s_infinite]">
                  {productPreview.cantidadFormateada}
                </span>
              ) : (
                <span className="text-4xl md:text-5xl font-black text-emerald-950/30 tracking-wider">
                  0.000 kg
                </span>
              )}
            </div>
          ) : (
            // Modo por Kilogramo: Cajero necesita saber cuánto COBRAR.
            <div className="text-center w-full">
              <span className="text-[9px] text-emerald-500/45 uppercase tracking-widest block font-bold mb-1">
                💵 TOTAL A COBRAR
              </span>
              {productPreview ? (
                <span className="text-4xl md:text-5xl font-black text-emerald-400 tracking-wider drop-shadow-[0_0_10px_rgba(52,211,153,0.7)]">
                  {formatCurrency(productPreview.monto)}
                </span>
              ) : (
                <span className="text-4xl md:text-5xl font-black text-emerald-950/30 tracking-wider">
                  $0.00
                </span>
              )}
            </div>
          )}
        </div>

        {/* Sub displays grid */}
        <div className="grid grid-cols-2 gap-3 border-t border-emerald-950/50 pt-3 mt-2 text-xs">
          {/* Subdisplay left */}
          <div className="bg-neutral-900/40 rounded p-2 border border-emerald-950/20 text-left">
            <span className="text-[9px] text-emerald-500/35 uppercase tracking-wider block font-bold mb-0.5">
              {inputType === "monto" ? "Monto Solicitado" : "Peso Registrado"}
            </span>
            <span className="text-sm font-bold tracking-wide text-emerald-500/80">
              {productPreview ? (
                inputType === "monto" ? formatCurrency(productPreview.monto) : productPreview.cantidadFormateada
              ) : (
                inputType === "monto" ? "$0.00" : "0.000 kg"
              )}
            </span>
          </div>

          {/* Subdisplay right */}
          <div className="bg-neutral-900/40 rounded p-2 border border-emerald-950/20 text-right">
            <span className="text-[9px] text-emerald-500/35 uppercase tracking-wider block font-bold mb-0.5">
              Precio por kg
            </span>
            <span className="text-sm font-bold tracking-wide text-emerald-500/80">
              {productPreview && calculatedUnitPrice > 0 ? (
                formatCurrency(calculatedUnitPrice)
              ) : (
                "$ —"
              )}
            </span>
          </div>
        </div>
      </div>

      {/* BANNER DE INSTRUCCIÓN ULTRA-CLARA Y HUMANA */}
      <div className={`border rounded-xl p-3 flex items-start gap-3 transition-all duration-300 ${
        !productPreview 
          ? "bg-gray-50 border-gray-200 text-gray-600" 
          : inputType === "monto" 
            ? "bg-amber-50 border-amber-200 text-amber-950 shadow-xs" 
            : "bg-emerald-50 border-emerald-200 text-emerald-950 shadow-xs"
      }`}>
        <div className="mt-0.5 shrink-0">
          {!productPreview ? (
            <Scale className="h-5 w-5 text-gray-400" />
          ) : inputType === "monto" ? (
            <Scale className="h-5 w-5 text-amber-600 animate-[bounce_1.5s_infinite_alternate]" />
          ) : (
            <DollarSign className="h-5 w-5 text-emerald-600 animate-[pulse_2s_infinite]" />
          )}
        </div>
        <div className="text-xs">
          <p className="font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-[10px]">
            {!productPreview 
              ? "⏳ Esperando Entrada" 
              : inputType === "monto" 
                ? "⚖️ Instrucción de Pesaje para Despacho" 
                : "✅ Total Listo para Cobrar"}
          </p>
          <p className="leading-relaxed font-medium">
            {!productPreview ? (
              inputType === "monto" 
                ? "Por favor, ingresa el monto en pesos solicitado por el cliente arriba para ver el peso equivalente que debes entregar."
                : "Por favor, ingresa el peso en gramos arriba para calcular de inmediato el precio total a cobrar."
            ) : inputType === "monto" ? (
              <>
                Debe cortar y entregar exactamente <strong className="text-xs font-bold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded-sm font-mono border border-amber-200">{productPreview.cantidadFormateada}</strong> de <span className="font-bold uppercase tracking-wider text-amber-900 bg-amber-100/30 px-1 rounded-sm">{productName || "producto"}</span> para darle al cliente el valor de <strong className="text-xs font-bold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded-sm font-mono border border-amber-200">{formatCurrency(productPreview.monto)}</strong>.
              </>
            ) : (
              <>
                Cobre un total de <strong className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-sm font-mono border border-emerald-200">{formatCurrency(productPreview.monto)}</strong> al cliente por haber pesado <strong className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-sm font-mono border border-emerald-200">{productPreview.cantidadFormateada}</strong> de <span className="font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100/30 px-1 rounded-sm">{productName || "producto"}</span>.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-2.5 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 text-xs font-semibold border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-neutral-950 transition cursor-pointer text-gray-700"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={!inputValue || parseFloat(inputValue) <= 0}
          className="flex-1 py-2.5 text-xs bg-neutral-900 hover:bg-neutral-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed text-white rounded-lg font-bold transition shadow-xs cursor-pointer"
        >
          Agregar al Carrito
        </button>
      </div>
    </div>
  );
};

export default WeightVolumeInput;