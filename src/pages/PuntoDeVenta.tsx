import { useState, useEffect, useRef, useMemo } from "react";
import { Search, ShoppingCart, Trash2, Plus, Minus, AlertCircle, Scale, Tag } from "lucide-react";
import { useCart } from "../store/useCart";
import type { CartItem } from "../store/useCart";
import { useProductsFromLocalStorage } from "../hooks/useProducts";
import { usePromotionsFromLocalStorage } from "../hooks/usePromotions";
import { useCreateSale } from "../hooks/useSales";
import { useAuthSession } from "../store/useAuthSession";
import type { Product, PaymentMethod } from "../services/types";
import type { Promotion } from "../services/promotions.service";
import { toast } from "react-hot-toast";
import WeightVolumeInput from "../components/Cart/WeightVolumeInput";

// Tipo combinado para mostrar productos y promociones en la búsqueda
type SearchResult = (Product | Promotion) & { 
  isPromotion?: boolean; 
  displayPrice: number;
  displayName: string;
  displayStock: number;
};

const PointSale = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [saleNotes, setSaleNotes] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

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
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, getTotal, getItemCount } = useCart();
  const { mutate: createSale, isPending: creatingSlot } = useCreateSale();
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
        product.active &&
        (product.name.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.code?.toLowerCase().includes(searchLower) ||
          product.barcode?.toLowerCase().includes(searchLower) ||
          product.category?.toLowerCase().includes(searchLower))
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
        promotion.active &&
        (promotion.name.toLowerCase().includes(searchLower) ||
          promotion.description?.toLowerCase().includes(searchLower))
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

  // Calcular previsualización del precio según peso ingresado
  useEffect(() => {
    if (selectedProductForWeight && weightInputValue) {
      const cantidad = parseFloat(weightInputValue);
      if (!isNaN(cantidad) && cantidad > 0) {
        const monto = cantidad * selectedProductForWeight.price;
        const cantidadFormateada = `${cantidad.toFixed(3)} kg`;
        setWeightPreview({ cantidad, monto, cantidadFormateada });
      }
    }
  }, [weightInputValue, selectedProductForWeight]);

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
              p.active
          );

          // Si no se encuentra y el código es muy largo, intentar con la mitad (scanner duplicado)
          if (!product && currentCode.length >= 12 && currentCode.length % 2 === 0) {
            const halfCode = currentCode.substring(0, currentCode.length / 2);
            product = productsRef.current.find(
              (p: Product) =>
                (p.code || p.barcode) &&
                ((p.code && p.code.toLowerCase() === halfCode.toLowerCase()) ||
                 (p.barcode && p.barcode.toLowerCase() === halfCode.toLowerCase())) &&
                p.active
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

      setSearchTerm("");
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

      // Agregar promoción como un item especial en el carrito
      // Usamos un ID con prefijo "promo-" para identificarlo
      const cartItem: Omit<CartItem, 'subtotal'> = {
        id: `promo-${promo.id}`,
        name: `🎁 ${promo.name}`,
        price: promo.promoPrice,
        costPrice: 0, // Las promociones no tienen precio de costo individual
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
      setSearchTerm("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al agregar promoción");
    }
  };

  // Confirmar agregación de producto con peso al carrito
  const handleConfirmWeightProduct = () => {
    if (!selectedProductForWeight || !weightInputValue || !weightPreview) return;

    try {
      const quantity = parseFloat(weightInputValue);
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
      setSearchTerm("");
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
    setSearchTerm("");
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
  const handleConfirmSale = () => {
    if (!user?.userId) {
      toast.error("Usuario no autenticado");
      return;
    }

    // Expandir promociones en productos individuales
    const expandedDetails: { productId: string; quantity: number }[] = [];
    
    cart.forEach((item) => {
      if (item.id.startsWith('promo-')) {
        // Es una promoción, expandirla en productos individuales
        const promoId = item.id.replace('promo-', '');
        const promoData = cartPromotions.get(promoId);
        
        if (promoData) {
          // Agregar cada producto de la promoción multiplicado por la cantidad de promociones
          promoData.items.forEach((promoItem) => {
            expandedDetails.push({
              productId: promoItem.product,
              quantity: promoItem.quantity * item.quantity,
            });
          });
        } else {
          toast.error(`Error: No se pudo procesar la promoción ${item.name}`);
        }
      } else {
        // Es un producto normal
        expandedDetails.push({
          productId: item.id,
          quantity: item.quantity,
        });
      }
    });

    const saleData = {
      paymentMethod: selectedPaymentMethod,
      details: expandedDetails,
      notes: saleNotes.trim() || undefined,
    };

    createSale(saleData, {
      onSuccess: (data) => {
        toast.success(`Venta #${data.id} completada exitosamente`);
        clearCart();
        setCartPromotions(new Map()); // Limpiar promociones guardadas
        setShowPaymentModal(false);
        setSaleNotes("");
        searchInputRef.current?.focus();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Error al procesar la venta");
      },
    });
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Punto de Venta</h1>
          <p className="text-sm text-gray-600 mt-1">Registra una nueva venta</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ShoppingCart size={18} />
          <span className="font-semibold">{getItemCount()} productos en carrito</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
        {/* Columna Izquierda - Búsqueda de Productos */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
          {/* Barra de búsqueda */}
          <div className="bg-white rounded-lg border border-gray-500/30 p-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar productos por nombre, código o categoría..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  setScanCode(value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim().length >= 6) {
                    e.preventDefault();
                    
                    const code = searchTerm.trim();
                    
                    // Buscar producto
                    let product = products.find(
                      (p: Product) =>
                        (p.code || p.barcode) &&
                        ((p.code && p.code.toLowerCase() === code.toLowerCase()) ||
                         (p.barcode && p.barcode.toLowerCase() === code.toLowerCase())) &&
                        p.active
                    );
                    
                    // Intentar con mitad si no se encuentra
                    if (!product && code.length >= 12 && code.length % 2 === 0) {
                      const halfCode = code.substring(0, code.length / 2);
                      product = products.find(
                        (p: Product) =>
                          (p.code || p.barcode) &&
                          ((p.code && p.code.toLowerCase() === halfCode.toLowerCase()) ||
                           (p.barcode && p.barcode.toLowerCase() === halfCode.toLowerCase())) &&
                          p.active
                      );
                    }
                    
                    if (product) {
                      
                      if (product.unitType === 'kilogramo') {
                        setSelectedProductForWeight(product);
                        setWeightInputType("cantidad");
                        setWeightInputValue("");
                        setWeightPreview(null);
                        toast.success(`Ingrese la cantidad en kg para ${product.name}`);
                        setSearchTerm("");
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
                          setSearchTerm("");
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Error al agregar producto");
                        }
                      }
                    } else {
                      // Si no se encuentra producto, buscar en promociones
                      const promotion = promotions.find(
                        (p: Promotion) =>
                          p.name.toLowerCase().includes(code.toLowerCase()) &&
                          p.active
                      );
                      
                      if (promotion) {
                        handleAddPromotionToCart(promotion);
                      } else {
                        toast.error(`Producto o promoción no encontrado`);
                      }
                    }
                  }
                }}
                disabled={loadingProducts || selectedProductForWeight !== null}
              />
            </div>
          </div>

          {/* Selector de Peso/Volumen para productos por kilogramo */}
          {selectedProductForWeight && (
            <div className="bg-white rounded-lg border border-blue-300 p-4">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-800 text-sm">
                  {selectedProductForWeight.name}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Precio: ${selectedProductForWeight.price.toFixed(2)} / kg
                </p>
              </div>

              <WeightVolumeInput
                inputType={weightInputType}
                inputValue={weightInputValue}
                productPreview={weightPreview}
                onInputTypeChange={setWeightInputType}
                onInputValueChange={setWeightInputValue}
                onCancel={handleCancelWeightProduct}
                onConfirm={handleConfirmWeightProduct}
              />
            </div>
          )}

          {/* Lista de Productos */}
          <div className="bg-white rounded-lg border border-gray-500/30 flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-500/30">
              <h3 className="font-semibold text-gray-800">Productos Disponibles</h3>
              <p className="text-xs text-gray-600 mt-1">
                {selectedProductForWeight
                  ? "Ingresa el peso del producto arriba"
                  : searchTerm
                  ? `${filteredProducts.length} resultados para "${searchTerm}"`
                  : "Escribe para buscar productos"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {selectedProductForWeight ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 font-semibold">Producto seleccionado</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Confirma el peso arriba para agregar al carrito
                  </p>
                </div>
              ) : loadingProducts ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Cargando productos...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Search size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">
                    {searchTerm
                      ? "No se encontraron productos"
                      : "Escribe en el campo de búsqueda"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((item) => {
                    const isPromotion = item.isPromotion === true;
                    
                    if (isPromotion) {
                      // Renderizar Promoción
                      const promo = item as Promotion;
                      return (
                        <button
                          key={`promo-${promo.id}`}
                          onClick={() => handleSelectProductForWeight(item as any)}
                          className="w-full p-3 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border-2 border-orange-300 hover:border-orange-400 rounded-lg transition text-left group"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Tag size={16} className="text-orange-600" />
                                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded">
                                  PROMOCIÓN
                                </span>
                                {promo.discountPercentage > 0 && (
                                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                                    -{promo.discountPercentage.toFixed(0)}%
                                  </span>
                                )}
                              </div>
                              <h4 className="font-semibold text-gray-800 group-hover:text-orange-600">
                                {promo.name}
                              </h4>
                              {promo.description && (
                                <p className="text-xs text-gray-600 mt-1">{promo.description}</p>
                              )}
                              <div className="mt-2 text-xs text-gray-600">
                                <p className="font-medium">Incluye:</p>
                                <ul className="ml-2 space-y-0.5">
                                  {promo.items.map((item, idx) => (
                                    <li key={idx}>
                                      • {item.quantity}x {item.snapshotName}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="flex items-center gap-2 mt-2 text-xs">
                                {promo.stock !== undefined && (
                                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">
                                    Stock: {promo.stock} promociones
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-lg font-bold text-orange-600">
                                ${promo.promoPrice.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-400 line-through">
                                ${promo.originalPrice.toFixed(2)}
                              </p>
                              <p className="text-xs text-green-600 font-semibold mt-1">
                                Ahorras ${promo.savings.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    } else {
                      // Renderizar Producto
                      const product = item as Product;
                      return (
                        <button
                          key={`prod-${product.id}`}
                          onClick={() => handleSelectProductForWeight(product)}
                          className="w-full p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition text-left group"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 group-hover:text-blue-600">
                                {product.name}
                              </h4>
                              {product.description && (
                                <p className="text-xs text-gray-500 mt-1">{product.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                                {product.category && (
                                  <span className="px-2 py-1 bg-gray-200 rounded">
                                    {product.category}
                                  </span>
                                )}
                                <span>Stock: {product.stock} {product.unitType}(s)</span>
                                {product.barcode && <span>Código: {product.barcode}</span>}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-lg font-bold text-green-600">
                                ${product.price.toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">
                                por {product.unitType}
                              </p>
                              {product.unitType === 'kilogramo' && (
                                <p className="text-xs text-blue-600 mt-1 flex items-center justify-end gap-1">
                                  <Scale size={12} />
                                  Pesar
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    }
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha - Carrito */}
        <div className="bg-white rounded-lg border border-gray-500/30 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-500/30">
            <h3 className="font-semibold text-gray-800">Carrito de Compras</h3>
            <p className="text-xs text-gray-600 mt-1">
              {cart.length} producto{cart.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Carrito vacío</p>
                <p className="text-gray-400 text-sm mt-1">
                  Busca y agrega productos para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 pr-2">
                        <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-500">
                          ${item.price.toFixed(2)} x {item.quantity} {item.unitType}(s)
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecrement(item)}
                          className="p-1 bg-gray-200 hover:bg-gray-300 rounded"
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
                          className="w-16 text-center border border-gray-300 rounded px-1 py-1 text-sm"
                          step={item.unitType === 'kilogramo' ? '0.1' : '1'}
                          min="0.1"
                        />
                        <button
                          onClick={() => handleIncrement(item)}
                          className="p-1 bg-gray-200 hover:bg-gray-300 rounded"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-bold text-gray-800">${item.subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer con totales y acciones */}
          <div className="p-4 border-t border-gray-500/30 space-y-3 bg-gray-50">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-blue-600">${total.toFixed(2)}</span>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleFinalizeSale}
                disabled={cart.length === 0 || creatingSlot}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {creatingSlot ? "Procesando..." : "Finalizar Venta"}
              </button>

              <button
                onClick={clearCart}
                disabled={cart.length === 0}
                className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Limpiar Carrito
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Finalizar Venta</h2>

            <div className="space-y-4">
              {/* Total a pagar */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600">Total a pagar</p>
                <p className="text-3xl font-bold text-blue-600">${total.toFixed(2)}</p>
              </div>

              {/* Método de pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="cuenta_corriente">Cuenta Corriente</option>
                </select>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  placeholder="Agregar notas sobre la venta..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Advertencia para cuenta corriente */}
              {selectedPaymentMethod === 'cuenta_corriente' && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Esta venta quedará como <strong>pendiente</strong> hasta que se registre el pago.
                  </p>
                </div>
              )}

              {/* Resumen */}
              <div className="border-t pt-3">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{cart.length}</strong> producto{cart.length !== 1 ? 's' : ''} en total
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSaleNotes("");
                  }}
                  disabled={creatingSlot}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmSale}
                  disabled={creatingSlot}
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition disabled:bg-gray-400"
                >
                  {creatingSlot ? "Procesando..." : "Confirmar Venta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointSale;