import { Barcode, Plus, Scale } from "lucide-react";
import WeightVolumeInput from "./WeightVolumeInput";

interface Product {
  id: number;
  nombre: string;
  codigo: string;
  categoriaNombre: string;
  precioVenta: string;
  unidadMedidaNombre: string;
  stockActual: number;
  unidadMedidaId: number;
}

interface ProductCardProps {
  producto: Product;
  isSelected: boolean;
  isWeightVolume: boolean;
  inputType?: "cantidad" | "monto";
  inputValue?: string;
  productPreview?: {
    cantidad: number;
    monto: number;
    cantidadFormateada: string;
  } | null;
  onProductClick: (producto: Product) => void;
  onInputTypeChange?: (type: "cantidad" | "monto") => void;
  onInputValueChange?: (value: string) => void;
  onCancel?: () => void;
  onConfirm?: () => void;
}

const ProductCard = ({
  producto,
  isSelected,
  isWeightVolume,
  inputType,
  inputValue,
  productPreview,
  onProductClick,
  onInputTypeChange,
  onInputValueChange,
  onCancel,
  onConfirm,
}: ProductCardProps) => {
  return (
    <div
      className={`border rounded-lg p-3 transition ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-400"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 text-sm">
            {producto.nombre}
          </h4>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Barcode size={12} />
            {producto.codigo}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {producto.categoriaNombre}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-800">${producto.precioVenta}</p>
          <p className="text-xs text-gray-500">/ {producto.unidadMedidaNombre}</p>
          <p
            className={`text-xs ${
              producto.stockActual > 10 ? "text-green-600" : "text-orange-600"
            }`}
          >
            Stock: {producto.stockActual}
          </p>
        </div>
      </div>

      {/* Formulario expandido para productos por peso/volumen */}
      {isSelected && isWeightVolume ? (
        <WeightVolumeInput
          inputType={inputType!}
          inputValue={inputValue!}
          productPreview={productPreview!}
          onInputTypeChange={onInputTypeChange!}
          onInputValueChange={onInputValueChange!}
          onCancel={onCancel!}
          onConfirm={onConfirm!}
        />
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onProductClick(producto);
          }}
          disabled={producto.stockActual === 0}
          className="w-full mt-2 py-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm rounded-lg transition flex items-center justify-center gap-2"
        >
          {isWeightVolume ? (
            <>
              <Scale size={16} />
              Pesar/Medir
            </>
          ) : (
            <>
              <Plus size={16} />
              Agregar
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ProductCard;