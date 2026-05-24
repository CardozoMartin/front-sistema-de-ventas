import { CreditCard, ShoppingCart, Trash2 } from 'lucide-react';
import CartItem from './CartItem';
import type { CartItem as CartItemData } from "../../store/useCart";
import { formatCurrency } from "../../utils/formatCurrency";

interface CartItemsProps {
  cartItems: CartItemData[];
  clearCart: () => void;
  removeFromCart: (id: string) => void;
  decrementQuantity: (id: string) => void;
  incrementQuantity: (id: string, stock: number) => void;
  formatQuantity: (item: any, cantidad: number) => string;
  subtotal: number;
  total: number;
  handleDrawCuentaCorriente: () => void;
  handleFinishSale: () => void;
}

const CartItems = ({
  cartItems,
  clearCart,
  removeFromCart,
  decrementQuantity,
  incrementQuantity,
  formatQuantity,
  subtotal,
  total,
  handleDrawCuentaCorriente,
  handleFinishSale,
}: CartItemsProps) => {
  return (
    <div className="flex flex-col gap-4 overflow-hidden lg:col-span-1">
      <div className="app-card flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-200 p-4">
          <div>
            <h3 className="section-title">Carrito</h3>
            <p className="mt-0.5 text-xs text-neutral-500">
              {cartItems.length} productos
            </p>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <Trash2 size={14} />
              Limpiar
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">El carrito está vacío</p>
              <p className="text-gray-400 text-xs mt-1">
                Agrega productos para continuar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  formatQuantity={formatQuantity}
                  onRemove={removeFromCart}
                  onDecrement={decrementQuantity}
                  onIncrement={incrementQuantity}
                />
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t border-gray-500/30 p-4 space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-800">
                <span>Total a cobrar:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              onClick={handleDrawCuentaCorriente}
            >
              <CreditCard size={20} />
              Cargar venta cuenta corriente
            </button>
            <button
              className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              onClick={handleFinishSale}
            >
              <CreditCard size={20} />
              Procesar Venta
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartItems;