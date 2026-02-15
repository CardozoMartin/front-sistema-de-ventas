import { Minus, Plus, X } from "lucide-react";

interface CartItemData {
  id: number;
  nombre: string;
  precioVenta: number;
  unidadMedidaNombre: string;
  cantidad: number;
  stockActual: number;
}

interface CartItemProps {
  item: CartItemData;
  formatQuantity: (item: any, cantidad: number) => string;
  onRemove: (id: number) => void;
  onDecrement: (id: number) => void;
  onIncrement: (id: number, stock: number) => void;
}

const CartItem = ({
  item,
  formatQuantity,
  onRemove,
  onDecrement,
  onIncrement,
}: CartItemProps) => {
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 text-sm">{item.nombre}</h4>
          <p className="text-xs text-gray-500">
            ${item.precioVenta} / {item.unidadMedidaNombre}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            {formatQuantity(item, item.cantidad)}
          </p>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="p-1 hover:bg-red-50 rounded transition"
        >
          <X size={16} className="text-red-600" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDecrement(item.id)}
            className="p-1 bg-gray-100 hover:bg-gray-200 rounded transition"
          >
            <Minus size={14} />
          </button>
          <span className="text-xs font-semibold px-2">
            {item.cantidad.toFixed(3)}
          </span>
          <button
            onClick={() => onIncrement(item.id, item.stockActual)}
            className="p-1 bg-gray-100 hover:bg-gray-200 rounded transition"
          >
            <Plus size={14} />
          </button>
        </div>
        <span className="font-bold text-gray-800">
          ${(Number(item.precioVenta) * item.cantidad).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default CartItem;