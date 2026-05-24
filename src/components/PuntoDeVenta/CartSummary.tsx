import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import type { CartItem } from "../../store/useCart";
import { formatCurrency } from "../../utils/formatCurrency";

interface CartSummaryProps {
  cart: CartItem[];
  subtotal: number;
  total: number;
  creatingSlot: boolean;
  removeFromCart: (id: string) => void;
  handleDecrement: (item: CartItem) => void;
  handleIncrement: (item: CartItem) => void;
  handleUpdateQuantity: (id: string, qty: number) => void;
  handleFinalizeSale: () => void;
  clearCart: () => void;
}

export const CartSummary = ({
  cart,
  subtotal,
  total,
  creatingSlot,
  removeFromCart,
  handleDecrement,
  handleIncrement,
  handleUpdateQuantity,
  handleFinalizeSale,
  clearCart,
}: CartSummaryProps) => {
  return (
    <div className="app-card flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <h3 className="section-title">Carrito</h3>
        <span className="badge-neutral">
          {cart.length} ítem{cart.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <ShoppingCart className="mb-3 h-8 w-8 text-neutral-300" strokeWidth={1.5} />
            <p className="text-sm font-medium text-neutral-700">Carrito vacío</p>
            <p className="mt-1 text-xs text-neutral-500">
              Buscá y agregá productos para comenzar
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={item.id}
                className="relative rounded-lg border border-neutral-200 bg-white p-3"
              >
                <div className="mb-2 flex justify-between gap-4 pr-6">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium leading-snug text-neutral-900">
                      {item.name}
                    </h4>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {formatCurrency(item.price)} c/u
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="icon-btn absolute right-2 top-2 hover:text-red-600"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
                  <div className="flex items-center rounded-md border border-neutral-200">
                    <button
                      type="button"
                      onClick={() => handleDecrement(item)}
                      className="icon-btn rounded-none px-2"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          handleUpdateQuantity(item.id, val);
                        }
                      }}
                      className="w-10 border-x border-neutral-200 bg-transparent p-0 text-center text-sm font-medium tabular-nums text-neutral-800 focus:outline-none"
                      step={item.unitType === "kilogramo" ? "0.1" : "1"}
                      min="0.1"
                    />
                    <button
                      type="button"
                      onClick={() => handleIncrement(item)}
                      className="icon-btn rounded-none px-2"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="price-display text-base">{formatCurrency(item.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-neutral-200 bg-neutral-50/50 p-4">
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-neutral-500">Subtotal</span>
          <span className="font-medium tabular-nums text-neutral-800">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-sm font-medium text-neutral-900">Total</span>
          <span className="text-2xl font-semibold tabular-nums text-neutral-900">
            {formatCurrency(total)}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleFinalizeSale}
            disabled={cart.length === 0 || creatingSlot}
            className="btn-primary w-full py-2.5 disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            {creatingSlot ? "Procesando..." : "Finalizar venta"}
          </button>
          <button
            type="button"
            onClick={clearCart}
            disabled={cart.length === 0}
            className="btn-secondary w-full py-2 text-red-700 hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
          >
            Limpiar carrito
          </button>
        </div>
      </div>
    </div>
  );
};
