import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Interfaz para productos en el carrito
 * Compatible con la estructura de productos del backend
 */
export interface CartItem {
  id: string; // ID del producto (MongoDB ObjectId)
  name: string;
  price: number; // Precio de venta
  costPrice?: number; // Precio de costo (opcional)
  quantity: number; // Cantidad a vender
  unitType: 'unidad' | 'kilogramo'; // Tipo de unidad
  stock: number; // Stock disponible
  category?: string;
  subtotal: number; // Calculado: price * quantity
}

// Guardar carrito en localStorage
const saveToLocalStorage = (cart: CartItem[]) => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

// Obtener carrito desde localStorage
const getFromLocalStorage = (): CartItem[] => {
  const data = localStorage.getItem("cart");
  return data ? JSON.parse(data) : [];
};

/**
 * Estado del carrito de compras
 */
interface CartState {
  cart: CartItem[];
  
  // Agregar producto al carrito
  addToCart: (product: Omit<CartItem, 'subtotal'>) => void;
  
  // Actualizar cantidad de un producto
  updateQuantity: (productId: string, newQuantity: number) => void;
  
  // Remover producto del carrito
  removeFromCart: (productId: string) => void;
  
  // Limpiar todo el carrito
  clearCart: () => void;
  
  // Obtener carrito actual
  getCart: () => CartItem[];
  
  // Obtener total del carrito
  getTotal: () => number;
  
  // Obtener cantidad de items en el carrito
  getItemCount: () => number;
}

/**
 * Store del carrito de compras
 * Usa Zustand con persistencia en localStorage
 */
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cart: getFromLocalStorage(),

      addToCart: (product) => {
        console.log(`🛒 addToCart llamado - Producto: ${product.name}, Cantidad: ${product.quantity}`);
        const currentCart = get().cart;
        const existingProduct = currentCart.find((item) => item.id === product.id);
        let updatedCart: CartItem[];

        if (existingProduct) {
          console.log(`📦 Producto YA existe en carrito. Cantidad actual: ${existingProduct.quantity}, Sumando: ${product.quantity}`);
          // Si el producto ya existe, actualizar cantidad
          const newQuantity = existingProduct.quantity + product.quantity;
          
          // Validar stock disponible
          if (newQuantity > product.stock) {
            throw new Error(`Stock insuficiente. Disponible: ${product.stock}`);
          }
          
          updatedCart = currentCart.map((item) =>
            item.id === product.id
              ? { 
                  ...item, 
                  quantity: newQuantity,
                  subtotal: item.price * newQuantity,
                }
              : item
          );
          console.log(`✅ Cantidad actualizada a: ${newQuantity}`);
        } else {
          console.log(`🆕 Producto NUEVO - Agregando con cantidad: ${product.quantity}`);
          // Validar stock para nuevo producto
          if (product.quantity > product.stock) {
            throw new Error(`Stock insuficiente. Disponible: ${product.stock}`);
          }
          
          // Agregar nuevo producto
          const newItem: CartItem = {
            ...product,
            subtotal: product.price * product.quantity,
          };
          updatedCart = [...currentCart, newItem];
          console.log(`✅ Producto agregado al carrito`);
        }
        
        set({ cart: updatedCart });
        saveToLocalStorage(updatedCart);
      },

      updateQuantity: (productId, newQuantity) => {
        const currentCart = get().cart;
        const product = currentCart.find((item) => item.id === productId);
        
        if (!product) {
          throw new Error('Producto no encontrado en el carrito');
        }
        
        // Validar cantidad mínima
        if (newQuantity <= 0) {
          // Si la cantidad es 0 o menor, remover el producto
          get().removeFromCart(productId);
          return;
        }
        
        // Validar stock disponible
        if (newQuantity > product.stock) {
          throw new Error(`Stock insuficiente. Disponible: ${product.stock}`);
        }
        
        const updatedCart = currentCart.map((item) =>
          item.id === productId
            ? { 
                ...item, 
                quantity: newQuantity,
                subtotal: item.price * newQuantity,
              }
            : item
        );
        
        set({ cart: updatedCart });
        saveToLocalStorage(updatedCart);
      },

      removeFromCart: (productId) => {
        const currentCart = get().cart;
        const updatedCart = currentCart.filter((item) => item.id !== productId);
        set({ cart: updatedCart });
        saveToLocalStorage(updatedCart);
      },

      clearCart: () => {
        set({ cart: [] });
        saveToLocalStorage([]);
      },

      getCart: () => {
        return get().cart;
      },

      getTotal: () => {
        const cart = get().cart;
        return cart.reduce((total, item) => total + item.subtotal, 0);
      },

      getItemCount: () => {
        const cart = get().cart;
        return cart.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage", // Nombre para el localStorage
      // Recargar el carrito al iniciar
      onRehydrateStorage: () => (state) => {
        if (state) {
          const cartFromStorage = getFromLocalStorage();
          state.cart = cartFromStorage;
        }
      },
    }
  )
);