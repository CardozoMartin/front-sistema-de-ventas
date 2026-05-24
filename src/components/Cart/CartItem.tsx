import { Minus, Plus, X } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import type { CartItem as StoreCartItem } from "../../store/useCart";

interface CartItemProps {
  item: StoreCartItem;
  formatQuantity: (item: StoreCartItem, cantidad: number) => string;
  onRemove: (id: string) => void;
  onDecrement: (id: string) => void;
  onIncrement: (id: string, stock: number) => void;
}

const CartItem = ({
  item,
  formatQuantity,
  onRemove,
  onDecrement,
  onIncrement,
}: CartItemProps) => {
  return (
    <div className="rounded-lg border border-neutral-200 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-neutral-900">{item.name}</h4>
          <p className="text-xs text-neutral-500">
            {formatCurrency(item.price)} / {item.unitType === "kilogramo" ? "kg" : "un"}
          </p>
          <p className="mt-1 text-xs text-neutral-600">
            {formatQuantity(item, item.quantity)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="icon-btn hover:text-red-600"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-md border border-neutral-200">
          <button
            type="button"
            onClick={() => onDecrement(item.id)}
            className="icon-btn rounded-none px-2"
          >
            <Minus size={14} />
          </button>
          <span className="px-2 text-xs font-medium tabular-nums">
            {item.quantity.toFixed(item.unitType === "kilogramo" ? 3 : 0)}
          </span>
          <button
            type="button"
            onClick={() => onIncrement(item.id, item.stock)}
            className="icon-btn rounded-none px-2"
          >
            <Plus size={14} />
          </button>
        </div>
        <p className="price-display text-base">{formatCurrency(item.subtotal)}</p>
      </div>
    </div>
  );
};

export default CartItem;
