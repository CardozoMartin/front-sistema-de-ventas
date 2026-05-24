import {
  AlertCircle,
  Save,
  X,
  Package,
  DollarSign,
  Tag,
  Plus,
  Trash2,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "../../utils/swalTheme.ts";
import { swalBackdrop, swalCustomClass } from "../../utils/swalTheme";
import { useCreatePromotion, useUpdatePromotion } from "../../hooks/usePromotions";
import { useProducts } from "../../hooks/useProducts";
import type { PromotionType } from "../../services/promotions.service";
import type { PromotionItem, CreatePromotionDto } from "../../services/promotions.service";

const PROMOTION_TYPES: { value: PromotionType; label: string; description: string }[] = [
  {
    value: "bundle",
    label: "Bundle",
    description: "Combo de múltiples productos",
  },
  {
    value: "quantity",
    label: "Por Cantidad",
    description: "Descuento por cantidad del mismo producto",
  },
  {
    value: "mixed",
    label: "Mixto",
    description: "Combinación de bundle y cantidad",
  },
];

interface FormData extends CreatePromotionDto {
  items: PromotionItem[];
}

const FormPromotion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const promotionEdit = location.state?.promotion ?? null;

  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [productSearch, setProductSearch] = useState("");
  const [isDropdownOpen, setIsOpenDropdown] = useState(false);

  // Obtener productos para seleccionar
  const { data: productsData, isLoading: productsLoading } = useProducts({ page: 1, limit: 1000 });
  const productos = productsData?.products || [];

  // Filtrar productos por término de búsqueda (nombre o código de barras)
  const filteredProducts = productos.filter((product) => {
    const searchLower = productSearch.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      (product.barcode && product.barcode.includes(searchLower))
    );
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
    setValue,
    getValues,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      type: "bundle",
      items: [],
      promoPrice: 0,
      originalPrice: 0,
      active: true,
      stock: 0,
      startsAt: "",
      endsAt: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const { mutate: createPromotion, isPending: isCreating } = useCreatePromotion();
  const { mutate: updatePromotion, isPending: isUpdating } = useUpdatePromotion();

  const isLoading = isCreating || isUpdating;

  // Valores observados
  const promoPrice = watch("promoPrice");
  const originalPrice = watch("originalPrice");
  const items = useWatch({ control, name: "items" }) || [];

  // Calcular originalPrice automáticamente
  useEffect(() => {
    const totalOriginal = items.reduce((acc, item) => {
      return acc + ((item.snapshotPrice || 0) * (item.quantity || 1));
    }, 0);
    setValue("originalPrice", totalOriginal);
  }, [items, setValue]);

  const maxAllowedStock = useMemo(() => {
    if (items.length === 0) return 0;
    const stocks = items.map(item => {
      const product = productos.find(p => p.id === item.product);
      if (!product || !item.quantity || item.quantity <= 0) return 0;
      return Math.floor((product.stock || 0) / item.quantity);
    });
    return Math.min(...stocks);
  }, [items, productos]);

  useEffect(() => {
    if (items.length === 0) {
      setValue("stock", 0);
      return;
    }
    const current = getValues("stock") || 0;
    if (current > maxAllowedStock || (current === 0 && !promotionEdit)) {
      setValue("stock", maxAllowedStock);
    }
  }, [maxAllowedStock, items.length, setValue, getValues, promotionEdit]);

  // Cálculos
  const savings = (originalPrice || 0) - (promoPrice || 0);
  const discountPercentage =
    originalPrice && originalPrice > 0
      ? Math.round(((savings / originalPrice) * 100) * 10) / 10
      : 0;

  // Prefill al editar
  useEffect(() => {
    if (promotionEdit) {
      reset({
        name: promotionEdit.name ?? "",
        description: promotionEdit.description ?? "",
        type: promotionEdit.type ?? "bundle",
        items: promotionEdit.items ?? [],
        promoPrice: promotionEdit.promoPrice ?? 0,
        originalPrice: promotionEdit.originalPrice ?? 0,
        active: promotionEdit.active ?? true,
        stock: promotionEdit.stock ?? 0,
        startsAt: promotionEdit.startsAt?.split("T")[0] ?? "",
        endsAt: promotionEdit.endsAt?.split("T")[0] ?? "",
      });
    }
  }, [promotionEdit, reset]);

  const handleAddProduct = () => {
    if (!selectedProductId) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona un producto",
        text: "Debes seleccionar un producto antes de agregarlo",
        buttonsStyling: false,
        customClass: swalCustomClass,
        backdrop: swalBackdrop,
      });
      return;
    }

    const product = productos.find((p) => p.id === selectedProductId);
    if (!product) return;

    // Verificar si ya está agregado
    if (items.some((item) => item.product === selectedProductId)) {
      Swal.fire({
        icon: "info",
        title: "Producto duplicado",
        text: "Este producto ya fue agregado a la promoción",
        buttonsStyling: false,
        customClass: swalCustomClass,
        backdrop: swalBackdrop,
      });
      return;
    }

    append({
      product: selectedProductId,
      quantity: 1,
      snapshotName: product.name,
      snapshotPrice: product.price,
    });

    setSelectedProductId("");
  };

  const handleSuccess = () => {
    setShowSuccess(true);
    reset();
    setTimeout(() => {
      setShowSuccess(false);
      navigate("/dashboard/promociones");
    }, 2000);
  };

  const onSubmit = (data: FormData) => {
    if (data.items.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Sin productos",
        text: "Debes agregar al menos un producto a la promoción",
        buttonsStyling: false,
        customClass: swalCustomClass,
        backdrop: swalBackdrop,
      });
      return;
    }

    if (data.promoPrice >= data.originalPrice) {
      Swal.fire({
        icon: "error",
        title: "Precio inválido",
        text: "El precio de promoción debe ser menor al precio original",
        buttonsStyling: false,
        customClass: swalCustomClass,
        backdrop: swalBackdrop,
      });
      return;
    }

    if (promotionEdit) {
      Swal.fire({
        title: "¿Actualizar promoción?",
        text: "Se guardarán los cambios realizados",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, actualizar",
        cancelButtonText: "Cancelar",
        buttonsStyling: false,
        customClass: swalCustomClass,
        backdrop: swalBackdrop,
      }).then((result) => {
        if (result.isConfirmed) {
          updatePromotion(
            { id: promotionEdit.id, data },
            { onSuccess: handleSuccess }
          );
        }
      });
    } else {
      createPromotion(data, { onSuccess: handleSuccess });
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: "¿Descartar cambios?",
      text: "Los cambios no guardados se perderán",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, descartar",
      cancelButtonText: "Seguir editando",
      buttonsStyling: false,
      customClass: swalCustomClass,
      backdrop: swalBackdrop,
    }).then((result) => {
      if (result.isConfirmed) {
        reset();
        navigate("/dashboard/promociones");
      }
    });
  };

  return (
    <div className="w-full py-6">
      {/* Toast de éxito */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50 flex items-center gap-3 animate-pulse">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Promoción {promotionEdit ? "actualizada" : "creada"} exitosamente
          </span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {promotionEdit ? "Editar Promoción" : "Nueva Promoción"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {promotionEdit
                ? "Modifica los datos de la promoción"
                : "Crea una nueva promoción para aumentar ventas"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="p-2.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md transition-all hover:scale-105"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ── Información básica ─────────────────────────────────────────── */}
          <section className="bg-slate-50/50 rounded-lg p-6 border border-slate-100 space-y-5">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-400" />
              Información básica
            </h3>

            {/* Nombre */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-slate-400" />
                Nombre <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("name", {
                  required: "El nombre es obligatorio",
                  maxLength: { value: 200, message: "Máximo 200 caracteres" },
                })}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-neutral-500/50 transition-all font-medium text-sm ${
                  errors.name
                    ? "border-rose-400 focus:ring-rose-500/50"
                    : "border-slate-200"
                }`}
                placeholder="Ej: 3 Tortillas por $1000"
              />
              {errors.name && (
                <p className="flex items-center gap-1 text-rose-500 text-xs font-medium mt-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                Descripción
              </label>
              <textarea
                {...register("description")}
                rows={2}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-neutral-500/50 transition-all font-medium text-sm resize-none"
                placeholder="Detalles adicionales de la promoción (opcional)"
              />
            </div>

            {/* Tipo de promoción */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Tipo de promoción
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PROMOTION_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start gap-3 p-4 border rounded-md cursor-pointer transition-all ${
                      watch("type") === type.value
                        ? "border-sky-500 bg-neutral-50 ring-2 ring-sky-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      {...register("type")}
                      type="radio"
                      value={type.value}
                      className="mt-1 w-4 h-4 text-neutral-800 border-slate-300 focus:ring-neutral-500"
                    />
                    <div>
                      <p className={`font-bold text-sm ${watch("type") === type.value ? "text-sky-900" : "text-slate-700"}`}>{type.label}</p>
                      <p className={`text-xs mt-1 ${watch("type") === type.value ? "text-neutral-800" : "text-slate-500"}`}>{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* ── Productos en la promoción ─────────────────────────────────── */}
          <section className="bg-slate-50/50 rounded-lg p-6 border border-slate-100 space-y-5">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Plus className="w-5 h-5 text-slate-400" />
              Productos ({items.length})
            </h3>

            {/* Selector de productos con buscador integrado */}
            <div className="flex gap-3 relative">
              <div className="flex-1 relative">
                {selectedProductId ? (
                  // Caja de producto seleccionado para agregar
                  <div className="flex items-center justify-between w-full border border-neutral-300 bg-neutral-50 rounded-md px-4 py-3 text-sm text-slate-800 transition-all">
                    <span className="font-bold">
                      {productos.find((p) => p.id === selectedProductId)?.name} - $
                      {productos.find((p) => p.id === selectedProductId)?.price}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProductId("");
                        setProductSearch("");
                      }}
                      className="p-1 hover:bg-neutral-100 rounded-full text-neutral-600 hover:text-neutral-800 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  // Input de búsqueda interactiva
                  <>
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setIsOpenDropdown(true);
                      }}
                      onFocus={() => setIsOpenDropdown(true)}
                      disabled={productsLoading}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-neutral-500/50 transition-all font-medium text-sm"
                      placeholder={
                        productsLoading
                          ? "Cargando productos..."
                          : "Escriba para buscar un producto..."
                      }
                    />
                    
                    {isDropdownOpen && productSearch.trim() && (
                      <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-xl z-50 divide-y divide-gray-100">
                        {filteredProducts.length === 0 ? (
                          <div className="p-3 text-sm text-gray-500 text-center">
                            No se encontraron productos coincidentes
                          </div>
                        ) : (
                          filteredProducts.map((producto) => (
                            <button
                              key={producto.id}
                              type="button"
                              onClick={() => {
                                setSelectedProductId(producto.id);
                                setIsOpenDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2.5 hover:bg-blue-50/80 text-sm text-gray-800 transition flex items-center justify-between"
                            >
                              <span className="font-medium">{producto.name}</span>
                              <span className="text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded text-xs">
                                ${producto.price}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  handleAddProduct();
                  setProductSearch(""); // Resetear campo de búsqueda después de agregar
                }}
                disabled={!selectedProductId}
                className="px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>

            {/* Lista de productos agregados */}
            <div className="space-y-3">
              {fields.length === 0 ? (
                <div className="text-center py-8 text-slate-500 bg-white border border-slate-200 border-dashed rounded-md">
                  <p className="text-sm font-medium">No hay productos agregados aún</p>
                </div>
              ) : (
                fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-4 p-4 bg-white border border-slate-100 shadow-sm rounded-md"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-800">
                        {field.snapshotName}
                      </p>
                      <div className="flex items-center gap-6 mt-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Cant:</label>
                          <input
                            {...register(`items.${index}.quantity` as const, {
                              min: 1,
                              valueAsNumber: true,
                            })}
                            type="number"
                            min="1"
                            step="1"
                            className="w-20 border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-neutral-500/50"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Precio:</label>
                          <div className="relative w-28">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                              $
                            </span>
                            <input
                              {...register(
                                `items.${index}.snapshotPrice` as const,
                                {
                                  min: 0.01,
                                  valueAsNumber: true,
                                }
                              )}
                              type="number"
                              step="0.01"
                              min="0"
                              readOnly
                              className="w-full border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-500 bg-slate-100 focus:outline-none cursor-not-allowed font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-3 text-rose-500 hover:bg-rose-50 rounded-md transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ── Precios ────────────────────────────────────────────────────── */}
          <section className="bg-slate-50/50 rounded-lg p-6 border border-slate-100 space-y-5">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-slate-400" />
              Precios
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Precio de promoción */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Precio de promoción <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                    $
                  </span>
                  <input
                    {...register("promoPrice", {
                      required: "El precio de promoción es obligatorio",
                      min: { value: 0.01, message: "Debe ser mayor a 0" },
                      valueAsNumber: true,
                    })}
                    type="number"
                    step="0.01"
                    min="0"
                    className={`w-full px-4 pl-8 py-3 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500/50 transition-all font-bold text-sm ${
                      errors.promoPrice
                        ? "border-rose-400 focus:ring-rose-500/50 text-rose-700"
                        : "border-slate-200 text-slate-800"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.promoPrice && (
                  <p className="flex items-center gap-1 text-rose-500 text-xs font-medium mt-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {errors.promoPrice.message}
                  </p>
                )}
              </div>

              {/* Precio original (Calculado) */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Precio original
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                    $
                  </span>
                  <input
                    {...register("originalPrice", { valueAsNumber: true })}
                    type="number"
                    readOnly
                    className="w-full px-4 pl-8 py-3 bg-slate-100 border border-slate-200 rounded-md focus:outline-none font-bold text-sm text-slate-500 cursor-not-allowed"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  Calculado en base a los productos agregados
                </p>
              </div>
            </div>

            {/* Descuento calculado */}
            {savings > 0 && (
              <div
                className={`flex items-center gap-2 px-4 py-3 rounded-md text-sm font-bold border shadow-sm ${
                  savings > 0
                    ? "bg-accent-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                <DollarSign className="w-5 h-5 flex-shrink-0" />
                Ahorran <span className="text-lg">${savings}</span> ({discountPercentage}%)
              </div>
            )}
          </section>

          {/* ── Inventario ─────────────────────────────────────────────────── */}
          <section className="bg-slate-50/50 rounded-lg p-6 border border-slate-100 space-y-5">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-400" />
              Inventario y Fechas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Stock */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Stock de promociones
                </label>
                <input
                  {...register("stock", {
                    min: { value: 0, message: "Debe ser 0 o mayor" },
                    max: { value: maxAllowedStock, message: `Máximo permitido: ${maxAllowedStock}` },
                    valueAsNumber: true,
                  })}
                  type="number"
                  min="0"
                  max={maxAllowedStock}
                  step="1"
                  className={`w-full px-4 py-3 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500/50 transition-all font-medium text-sm ${
                    errors.stock
                      ? "border-rose-400 focus:ring-rose-500/50 text-rose-700"
                      : "border-slate-200 text-slate-800"
                  }`}
                  placeholder="Ej: 50"
                />
                {errors.stock ? (
                  <p className="flex items-center gap-1 text-rose-500 text-xs font-medium mt-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {errors.stock.message}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    Máximo posible según inventario: <span className="font-bold text-slate-700">{maxAllowedStock}</span>
                  </p>
                )}
              </div>

              {/* Estado */}
              <div className="flex items-center pt-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-white border border-slate-200 rounded-md w-full">
                  <input
                    {...register("active")}
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-neutral-800 focus:ring-neutral-500"
                  />
                  <span className="text-sm font-bold text-slate-700">
                    Promoción activa
                  </span>
                </label>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Fecha de inicio */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Fecha de inicio (opcional)
                </label>
                <input
                  {...register("startsAt")}
                  type="date"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500/50 transition-all font-medium text-sm text-slate-700"
                />
              </div>

              {/* Fecha de fin */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Fecha de fin (opcional)
                </label>
                <input
                  {...register("endsAt")}
                  type="date"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500/50 transition-all font-medium text-sm text-slate-700"
                />
              </div>
            </div>
          </section>

          {/* ── Botones ────────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-5 py-3 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-all duration-300 font-bold text-sm order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex justify-center items-center gap-2 px-5 py-3 bg-neutral-900 text-white rounded-md hover:bg-neutral-800  shadow-sm sky-500/30 transition-all duration-300 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              <Save className="w-5 h-5" />
              {isLoading
                ? promotionEdit
                  ? "Actualizando..."
                  : "Guardando..."
                : promotionEdit
                ? "Actualizar Promoción"
                : "Guardar Promoción"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormPromotion;
