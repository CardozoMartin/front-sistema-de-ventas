import { useState, useEffect, useRef, useMemo } from "react";
import { useCart } from "../../store/useCart";
import type { CartItem } from "../../store/useCart";
import { useProductsFromLocalStorage, useProductStockSocket } from "../../hooks/useProducts";
import { usePromotionsFromLocalStorage } from "../../hooks/usePromotions";
import { useCreateSale } from "../../hooks/useSales";
import { useClients } from "../../hooks/useClients";
import { useAuthSession } from "../../store/useAuthSession";
import type { Product, PaymentMethod } from "../../services/types";
import { formatGramsFromKg } from "../../utils/weightSale";
import type { Promotion } from "../../services/promotions.service";
import { toast } from "react-hot-toast";
import Swal from "../../utils/swalTheme";
import { PaymentModal } from "../../components/PuntoDeVenta/PaymentModal";
import { CartSummary } from "../../components/PuntoDeVenta/CartSummary";
import { ProductSearchPanel } from "../../components/PuntoDeVenta/ProductSearchPanel";
import { PrintableTicket } from "../../components/TicketPrinter/PrintableTicket";
import type { Sale } from "../../services/types";

// Tipo combinado para mostrar productos y promociones en la búsqueda
type SearchResult = (Product | Promotion) & { 
  isPromotion?: boolean; 
  displayPrice: number;
  displayName: string;
  displayStock: number;
};

const PointSale = () => {
  // Activar sincronización de stock por WebSocket
  useProductStockSocket();

  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [saleNotes, setSaleNotes] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Obtener clientes activos
  const { data: clients = [] } = useClients();

  // Estado para promociones en el carrito (para expandirlas al procesar venta)
  const [cartPromotions, setCartPromotions] = useState<Map<string, Promotion>>(new Map());

  // Estado para manejo de peso/volumen
  const [selectedProductForWeight, setSelectedProductForWeight] = useState<Product | null>(null);
  const [weightInputType, setWeightInputType] = useState<"cantidad" | "monto">("cantidad");
  const [weightInputValue, setWeightInputValue] = useState("");
  const [weightPreview, setWeightPreview] = useState<{
    cantidad: number;
    monto: number;
    cantidadFormateada: string;
  } | null>(null);

  // Estado para la impresión del ticket
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  // Efecto para imprimir el ticket cuando se procesa una venta
  useEffect(() => {
    if (lastSale) {
      setTimeout(() => {
        Swal.fire({
          title: '¿Desea imprimir el ticket?',
          text: `La venta #${lastSale.id.substring(0, 8).toUpperCase()} se ha completado exitosamente.`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, imprimir',
          cancelButtonText: 'No, continuar',
        }).then((result) => {
          if (result.isConfirmed) {
            window.print();
          }
          // Limpiar la última venta para evitar reimpresiones incidentales
          setLastSale(null);
        });
      }, 300); // Pequeño delay para asegurar actualización del DOM
    }
  }, [lastSale]);

  // Estado para el escaneo de código de barras
  const [scanCode, setScanCode] = useState("");
  const scanTimeoutRef = useRef<number | null>(null);
  const productsRef = useRef<Product[]>([]);
  const addToCartRef = useRef<any>(null);
  const showPaymentModalRef = useRef(false);
  const selectedProductForWeightRef = useRef<Product | null>(null);
  const isProcessingScanRef = useRef(false);  // Flag para evitar procesamiento duplicado

  // Hooks
  const products = useProductsFromLocalStorage();
  const promotions = usePromotionsFromLocalStorage();
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, getTotal } = useCart();
  const { mutateAsync: createSaleAsync, isPending: creatingSlot } = useCreateSale();
  const { user } = useAuthSession();

  const loadingProducts = false;

  // Mantener refs actualizados (no causa re-renders porque no hay setState)
  productsRef.current = products;
  addToCartRef.current = addToCart;
  showPaymentModalRef.current = showPaymentModal;
  selectedProductForWeightRef.current = selectedProductForWeight;

  // Debug: Log de productos y promociones cargados
  useEffect(() => {
    // Empty - logs removed in production
  }, [products.length, promotions.length]);

  // Calcular totales
  const subtotal = getTotal();
  const total = subtotal;

  // Filtrar productos y promociones usando useMemo
  const filteredProducts = useMemo(() => {
    if (searchTerm.trim() === "") {
      return [];
    }

    const searchLower = searchTerm.toLowerCase();
    const results: SearchResult[] = [];
    
    // Buscar en productos
    products.forEach((product: Product) => {
      if (
        product.active !== false &&
        (product.name.toLowerCase().startsWith(searchLower) ||
          product.code?.toLowerCase().startsWith(searchLower) ||
          product.barcode?.toLowerCase().startsWith(searchLower))
      ) {
        results.push({
          ...product,
          isPromotion: false,
          displayPrice: product.price,
          displayName: product.name,
          displayStock: product.stock,
        });
      }
    });

    // Buscar en promociones
    promotions.forEach((promotion: Promotion) => {
      if (
        promotion.active !== false &&
        promotion.name.toLowerCase().startsWith(searchLower)
      ) {
        results.push({
          ...promotion,
          isPromotion: true,
          displayPrice: promotion.promoPrice,
          displayName: promotion.name,
          displayStock: promotion.stock || 0,
        });
      }
    });

    return results.slice(0, 10);
  }, [searchTerm, products, promotions]);

  // Focus en el input de búsqueda al cargar
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Calcular previsualización del precio según peso ingresado o monto
  useEffect(() => {
    if (selectedProductForWeight && weightInputValue) {
      const inputValue = parseFloat(weightInputValue);
      if (!isNaN(inputValue) && inputValue > 0) {
        if (weightInputType === "cantidad") {
          // Input es peso en kg, calcular monto
          const cantidad = inputValue;
          const monto = cantidad * selectedProductForWeight.price;
          const cantidadFormateada = `${formatGramsFromKg(cantidad)} (${cantidad.toFixed(3)} kg)`;
          setWeightPreview({ cantidad, monto, cantidadFormateada });
        } else {
          // Input es monto en pesos (ya viene dividido por 100 para centavos), calcular peso en kg
          const monto = inputValue;
          const cantidad = monto / selectedProductForWeight.price;
          const cantidadFormateada = `${formatGramsFromKg(cantidad)} (${cantidad.toFixed(3)} kg)`;
          setWeightPreview({ cantidad, monto, cantidadFormateada });
        }
      } else {
        setWeightPreview(null);
      }
    } else {
      setWeightPreview(null);
    }
  }, [weightInputValue, selectedProductForWeight, weightInputType]);

  // Manejar escaneo de código de barras
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Usar refs para evitar recrear el listener
      if (showPaymentModalRef.current || selectedProductForWeightRef.current) return;

      if (event.key === 'Enter') {
        // Si hay código acumulado, es del scanner (aunque esté en el input)
        const currentCode = scanCode.trim();
        if (currentCode.length >= 6) {  // Los códigos de barras tienen al menos 6 caracteres
          event.preventDefault();
          event.stopPropagation();
          
          // Evitar procesamiento duplicado
          if (isProcessingScanRef.current) {
            return;
          }
          
          // ===== BLOQUEAR INMEDIATAMENTE =====
          isProcessingScanRef.current = true;

          // Limpiar el código inmediatamente
          setScanCode("");
          setSearchTerm("");  // Limpiar también la búsqueda

          // Buscar producto (intentar con código completo primero)
          let product = productsRef.current.find(
            (p: Product) =>
              (p.code || p.barcode) &&
              ((p.code && p.code.toLowerCase() === currentCode.toLowerCase()) ||
               (p.barcode && p.barcode.toLowerCase() === currentCode.toLowerCase())) &&
              p.active !== false
          );

          // Si no se encuentra y el código es muy largo, intentar con la mitad (scanner duplicado)
          if (!product && currentCode.length >= 12 && currentCode.length % 2 === 0) {
            const halfCode = currentCode.substring(0, currentCode.length / 2);
            product = productsRef.current.find(
              (p: Product) =>
                (p.code || p.barcode) &&
                ((p.code && p.code.toLowerCase() === halfCode.toLowerCase()) ||
                 (p.barcode && p.barcode.toLowerCase() === halfCode.toLowerCase())) &&
                p.active !== false
            );
          }

          if (product) {
            
            if (product.unitType === 'kilogramo') {
              setSelectedProductForWeight(product);
              setWeightInputType("cantidad");
              setWeightInputValue("");
              setWeightPreview(null);
              toast.success(`Ingrese la cantidad en kg para ${product.name}`);
            } else {
              try {
                const cartItem: Omit<CartItem, 'subtotal'> = {
                  id: product.id.toString(),
                  name: product.name,
                  price: product.price,
                  costPrice: product.costPrice,
                  quantity: 1,
                  unitType: 'unidad',
                  stock: product.stock,
                  category: product.category,
                };
                if (addToCartRef.current) {
                  addToCartRef.current(cartItem);
                  toast.success(`${product.name} agregado (1 unidad)`);
                }
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Error al agregar producto");
              }
            }
          } else {
            toast.error(`Producto con código ${currentCode} no encontrado`);
          }

          // Resetear flag después de 1 segundo
          setTimeout(() => {
            isProcessingScanRef.current = false;
          }, 1000);
          
          return;
        }
      }

      // Acumular caracteres del escáner
      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        setScanCode((prev) => prev + event.key);

        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = setTimeout(() => {
          setScanCode("");
        }, 3000);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };
  }, []); // Array vacío: listener se crea una sola vez

  // Agregar producto al carrito
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    try {
      const cartItem: Omit<CartItem, 'subtotal'> = {
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        costPrice: product.costPrice,
        quantity,
        unitType: (product.unitType === 'kilogramo' ? 'kilogramo' : 'unidad'),
        stock: product.stock,
        category: product.category,
      };

      addToCart(cartItem);
      toast.success(`${product.name} agregado al carrito`);

      searchInputRef.current?.focus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al agregar producto");
    }
  };

  // Seleccionar producto para ingresar peso
  const handleSelectProductForWeight = (item: Product | Promotion) => {
    // Verificar si es una promoción
    if ('promoPrice' in item) {
      // Es una promoción
      const promo = item as Promotion;
      handleAddPromotionToCart(promo);
    } else {
      // Es un producto normal
      const product = item as Product;
      if (product.unitType === 'kilogramo') {
        setSelectedProductForWeight(product);
        setWeightInputType("cantidad");
        setWeightInputValue("");
        setWeightPreview(null);
      } else {
        handleAddToCart(product, 1);
      }
    }
  };

  // Agregar promoción al carrito
  const handleAddPromotionToCart = (promo: Promotion) => {
    try {
      // Validar stock de la promoción
      if (promo.stock !== undefined && promo.stock <= 0) {
        toast.error(`La promoción "${promo.name}" no tiene stock disponible`);
        return;
      }

      // Calcular costo real de la promoción (suma de costos de productos incluidos)
      const promoCost = promo.items.reduce((sum, item) => {
        const product = products.find(p => p.id === (typeof item.product === 'string' ? item.product : (item.product as any)?.id || (item.product as any)?._id));
        const unitCost = product?.costPrice || 0;
        return sum + (unitCost * item.quantity);
      }, 0);

      // Agregar promoción como un item especial en el carrito
      // Usamos un ID con prefijo "promo-" para identificarlo
      const cartItem: Omit<CartItem, 'subtotal'> = {
        id: `promo-${promo.id}`,
        name: `🎁 ${promo.name}`,
        price: promo.promoPrice,
        costPrice: promoCost, // Costo real calculado desde los productos del pack
        quantity: 1,
        unitType: 'unidad',
        stock: promo.stock || 999,
        category: 'Promoción',
      };

      addToCart(cartItem);
      
      // Guardar la información de la promoción para expandirla después
      setCartPromotions(prev => {
        const newMap = new Map(prev);
        newMap.set(promo.id, promo);
        return newMap;
      });

      toast.success(`Promoción "${promo.name}" agregada al carrito`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al agregar promoción");
    }
  };

  // Confirmar agregación de producto con peso al carrito
  const handleConfirmWeightProduct = () => {
    if (!selectedProductForWeight || !weightInputValue || !weightPreview) return;

    try {
      const quantity = weightPreview.cantidad;
      if (isNaN(quantity) || quantity <= 0) {
        toast.error("Cantidad inválida");
        return;
      }

      const cartItem: Omit<CartItem, 'subtotal'> = {
        id: selectedProductForWeight.id.toString(),
        name: selectedProductForWeight.name,
        price: selectedProductForWeight.price,
        costPrice: selectedProductForWeight.costPrice,
        quantity,
        unitType: 'kilogramo',
        stock: selectedProductForWeight.stock,
        category: selectedProductForWeight.category,
      };

      addToCart(cartItem);
      toast.success(`${selectedProductForWeight.name} (${quantity.toFixed(3)} kg) agregado al carrito`);

      setSelectedProductForWeight(null);
      setWeightInputValue("");
      setWeightPreview(null);
      searchInputRef.current?.focus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al agregar producto");
    }
  };

  // Cancelar selección de peso
  const handleCancelWeightProduct = () => {
    setSelectedProductForWeight(null);
    setWeightInputValue("");
    setWeightPreview(null);
    searchInputRef.current?.focus();
  };

  // Actualizar cantidad en el carrito
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    try {
      updateQuantity(productId, newQuantity);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar cantidad");
    }
  };

  // Incrementar cantidad
  const handleIncrement = (item: CartItem) => {
    const newQuantity = item.quantity + (item.unitType === 'kilogramo' ? 0.1 : 1);
    handleUpdateQuantity(item.id, Number(newQuantity.toFixed(3)));
  };

  // Decrementar cantidad
  const handleDecrement = (item: CartItem) => {
    const decrement = item.unitType === 'kilogramo' ? 0.1 : 1;
    const newQuantity = item.quantity - decrement;

    if (newQuantity <= 0) {
      removeFromCart(item.id);
    } else {
      handleUpdateQuantity(item.id, Number(newQuantity.toFixed(3)));
    }
  };

  // Finalizar venta
  const handleFinalizeSale = () => {
    if (cart.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }
    setShowPaymentModal(true);
  };

  // Confirmar venta
  const handleConfirmSale = async () => {
    if (!user?.userId) {
      toast.error("Usuario no autenticado");
      return;
    }

    const productDetails: { productId: string; quantity: number }[] = [];
    const promoSales: { promotionId: string; quantity: number }[] = [];

    for (const item of cart) {
      if (item.id.startsWith("promo-")) {
        const promoId = item.id.replace("promo-", "");
        if (!cartPromotions.has(promoId)) {
          toast.error(`Error: No se pudo procesar la promoción ${item.name}`);
          return;
        }
        promoSales.push({ promotionId: promoId, quantity: item.quantity });
      } else {
        productDetails.push({
          productId: item.id,
          quantity: item.quantity,
        });
      }
    }

    if (selectedPaymentMethod === 'cuenta_corriente' && !selectedClientId) {
      toast.error("Debe seleccionar un cliente para realizar la venta al fiado (Cuenta Corriente)");
      return;
    }

    const basePayload = {
      paymentMethod: selectedPaymentMethod,
      notes: saleNotes.trim() || undefined,
      clientId: selectedPaymentMethod === 'cuenta_corriente' ? selectedClientId : undefined,
    };

    try {
      let lastCreatedSale: Sale | undefined;

      if (productDetails.length > 0) {
        const productSale = await createSaleAsync({
          ...basePayload,
          details: productDetails,
        });
        lastCreatedSale = productSale as unknown as Sale;
      }

      for (const promo of promoSales) {
        const promoSale = await createSaleAsync({
          ...basePayload,
          promotionId: promo.promotionId,
          promotionQuantity: promo.quantity,
        });
        lastCreatedSale = promoSale as unknown as Sale;
      }

      if (lastCreatedSale) {
        setLastSale(lastCreatedSale);
      }

      toast.success(
        lastCreatedSale?.id
          ? `Venta #${lastCreatedSale.id} completada exitosamente`
          : "Venta completada exitosamente"
      );
      clearCart();
      setCartPromotions(new Map());
      setShowPaymentModal(false);
      setSaleNotes("");
      setSelectedClientId("");
      searchInputRef.current?.focus();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al procesar la venta");
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-4 sm:p-6">
      <PrintableTicket sale={lastSale} />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-3 lg:overflow-hidden">
        {/* Columna Izquierda - Búsqueda de Productos */}
        <ProductSearchPanel
          searchInputRef={searchInputRef as any}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setScanCode={setScanCode}
          filteredProducts={filteredProducts}
          selectedProductForWeight={selectedProductForWeight}
          loadingProducts={loadingProducts}
          handleSelectProductForWeight={handleSelectProductForWeight}
          weightInputType={weightInputType}
          weightInputValue={weightInputValue}
          weightPreview={weightPreview}
          setWeightInputType={setWeightInputType}
          setWeightInputValue={setWeightInputValue}
          handleCancelWeightProduct={handleCancelWeightProduct}
          handleConfirmWeightProduct={handleConfirmWeightProduct}
          handleSearchKeyDown={(e) => {
            if (e.key === 'Enter' && searchTerm.trim().length >= 6) {
              e.preventDefault();
              
              const code = searchTerm.trim();
              
              // Buscar producto
              let product = products.find(
                (p: Product) =>
                  (p.code || p.barcode) &&
                  ((p.code && p.code.toLowerCase() === code.toLowerCase()) ||
                   (p.barcode && p.barcode.toLowerCase() === code.toLowerCase())) &&
                  p.active !== false
              );
              
              // Intentar con mitad si no se encuentra
              if (!product && code.length >= 12 && code.length % 2 === 0) {
                const halfCode = code.substring(0, code.length / 2);
                product = products.find(
                  (p: Product) =>
                    (p.code || p.barcode) &&
                    ((p.code && p.code.toLowerCase() === halfCode.toLowerCase()) ||
                     (p.barcode && p.barcode.toLowerCase() === halfCode.toLowerCase())) &&
                    p.active !== false
                );
              }
              
              if (product) {
                
                if (product.unitType === 'kilogramo') {
                  setSelectedProductForWeight(product);
                  setWeightInputType("cantidad");
                  setWeightInputValue("");
                  setWeightPreview(null);
                  toast.success(`Ingrese la cantidad en kg para ${product.name}`);
                } else {
                  try {
                    const cartItem: Omit<CartItem, 'subtotal'> = {
                      id: product.id.toString(),
                      name: product.name,
                      price: product.price,
                      costPrice: product.costPrice,
                      quantity: 1,
                      unitType: 'unidad',
                      stock: product.stock,
                      category: product.category,
                    };
                    addToCart(cartItem);
                    toast.success(`${product.name} agregado al carrito`);
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : "Error al agregar producto");
                  }
                }
              } else {
                // Si no se encuentra producto, buscar en promociones
                const promotion = promotions.find(
                  (p: Promotion) =>
                    p.name.toLowerCase().includes(code.toLowerCase()) &&
                    p.active !== false
                );
                
                if (promotion) {
                  handleAddPromotionToCart(promotion);
                } else {
                  toast.error(`Producto o promoción no encontrado`);
                }
              }
            }
          }}
        />

        <div className="flex min-h-0 flex-col max-lg:max-h-[38vh] max-lg:min-h-[38vh] lg:col-span-1 lg:max-h-full">
        <CartSummary
          cart={cart}
          subtotal={subtotal}
          total={total}
          creatingSlot={creatingSlot}
          removeFromCart={removeFromCart}
          handleDecrement={handleDecrement}
          handleIncrement={handleIncrement}
          handleUpdateQuantity={handleUpdateQuantity}
          handleFinalizeSale={handleFinalizeSale}
          clearCart={clearCart}
        />
        </div>
      </div>

      {/* Modal de Pago */}
      <PaymentModal
        show={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSaleNotes("");
        }}
        total={total}
        selectedPaymentMethod={selectedPaymentMethod}
        setSelectedPaymentMethod={setSelectedPaymentMethod}
        clients={clients}
        selectedClientId={selectedClientId}
        setSelectedClientId={setSelectedClientId}
        saleNotes={saleNotes}
        setSaleNotes={setSaleNotes}
        creatingSlot={creatingSlot}
        cartLength={cart.length}
        onConfirmSale={handleConfirmSale}
      />
    </div>
  );
};

export default PointSale;