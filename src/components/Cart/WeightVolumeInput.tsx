import { Scale, DollarSign } from "lucide-react";
import { useState } from "react";

interface WeightVolumeInputProps {
  inputType: "cantidad" | "monto";
  inputValue: string;
  productPreview: {
    cantidad: number;
    monto: number;
    cantidadFormateada: string;
  } | null;
  onInputTypeChange: (type: "cantidad" | "monto") => void;
  onInputValueChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const WeightVolumeInput = ({
  inputType,
  inputValue,
  productPreview,
  onInputTypeChange,
  onInputValueChange,
  onCancel,
  onConfirm,
}: WeightVolumeInputProps) => {
  const [displayValue, setDisplayValue] = useState("");

  // Formatea el valor ingresado dividiendo por 1000
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ""); // Solo números
    
    if (rawValue === "") {
      setDisplayValue("");
      onInputValueChange("");
      return;
    }

    // Convierte el valor a número y divide por 1000
    const numericValue = parseInt(rawValue, 10);
    const formattedValue = (numericValue / 1000).toFixed(3);
    
    setDisplayValue(rawValue);
    onInputValueChange(formattedValue);
  };

  // Formatea el display agregando el punto decimal
  const formatDisplay = (value: string) => {
    if (!value) return "";
    
    // Asegura que tenga al menos 4 dígitos (000X)
    const padded = value.padStart(4, "0");
    
    // Inserta el punto: 0600 -> 0.600
    return padded.slice(0, -3) + "." + padded.slice(-3);
  };

  return (
    <div className="space-y-2 mt-3 pt-3 border-t border-blue-200">
      {/* Selector de tipo */}
      <div className="flex gap-2">
        <button
          onClick={() => onInputTypeChange("cantidad")}
          className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition ${
            inputType === "cantidad"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
          }`}
        >
          <Scale size={12} className="inline mr-1" />
          Por Kilogramo
        </button>
        <button
          onClick={() => onInputTypeChange("monto")}
          className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition ${
            inputType === "monto"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
          }`}
          disabled
        >
          <DollarSign size={12} className="inline mr-1" />
          Por Dinero
        </button>
      </div>

      {/* Input con formato automático */}
      <div className="relative">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Ingresa peso en gramos
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleInputChange}
          placeholder="Ej: 600 = 0.600"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          autoFocus
        />
        {displayValue && (
          <div className="absolute right-3 top-8 text-xs text-gray-500 bg-white px-1">
            = {formatDisplay(displayValue)} kg
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        💡 Ejemplos: 600 = 0.600 kg | 1500 = 1.500 kg | 2000 = 2.000 kg
      </p>

      {/* Vista previa con cálculo dinámico de precio */}
      {productPreview && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-600">
              <strong>Cantidad:</strong>
            </p>
            <p className="text-sm font-semibold text-blue-900">
              {productPreview.cantidadFormateada}
            </p>
          </div>
          
          <div className="border-t border-blue-200 pt-2">
            <p className="text-xs text-gray-600 mb-1">
              <strong>Total a pagar:</strong>
            </p>
            <p className="text-2xl font-bold text-blue-600">
              ${productPreview.monto.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Cambios en tiempo real según el peso
            </p>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={!inputValue || parseFloat(inputValue) <= 0}
          className="flex-1 py-2 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-semibold transition"
        >
          Agregar
        </button>
      </div>
    </div>
  );
};

export default WeightVolumeInput;