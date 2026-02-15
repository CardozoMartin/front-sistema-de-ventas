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
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
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

  // Obtener productos para seleccionar
  const { data: productsData, isLoading: productsLoading } = useProducts({ page: 1, limit: 1000 });
  const productos = productsData?.products || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
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
  const items = watch("items");

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
      });
      return;
    }

    if (data.promoPrice >= data.originalPrice) {
      Swal.fire({
        icon: "error",
        title: "Precio inválido",
        text: "El precio de promoción debe ser menor al precio original",
      });
      return;
    }

    if (promotionEdit) {
      Swal.fire({
        title: "¿Actualizar promoción?",
        text: "Se guardarán los cambios realizados",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, actualizar",
        cancelButtonText: "Cancelar",
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
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, descartar",
      cancelButtonText: "Seguir editando",
    }).then((result) => {
      if (result.isConfirmed) {
        reset();
        navigate("/dashboard/promociones");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* Toast de éxito */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50 flex items-center gap-3 animate-pulse">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Promoción {promotionEdit ? "actualizada" : "creada"} exitosamente
          </span>
        </div>
      )}

      <div className="bg-white rounded-md border border-gray-500/30 p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* ── Información básica ─────────────────────────────────────────── */}
          <section className="bg-gray-50 rounded-md p-5 border border-gray-200 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              Información básica
            </h3>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name", {
                  required: "El nombre es obligatorio",
                  maxLength: { value: 200, message: "Máximo 200 caracteres" },
                })}
                className={`w-full border rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 transition ${
                  errors.name
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Ej: 3 Tortillas por $1000"
              />
              {errors.name && (
                <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Descripción
              </label>
              <textarea
                {...register("description")}
                rows={2}
                className="w-full border border-gray-300 hover:border-gray-400 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 transition resize-none"
                placeholder="Detalles adicionales de la promoción (opcional)"
              />
            </div>

            {/* Tipo de promoción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de promoción
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PROMOTION_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer transition text-left ${
                      watch("type") === type.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                  >
                    <input
                      {...register("type")}
                      type="radio"
                      value={type.value}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-sm text-gray-800">{type.label}</p>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* ── Productos en la promoción ─────────────────────────────────── */}
          <section className="bg-gray-50 rounded-md p-5 border border-gray-200 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Plus className="w-4 h-4 text-gray-500" />
              Productos ({items.length})
            </h3>

            {/* Selector de productos */}
            <div className="flex gap-2">
              <div className="flex-1">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  disabled={productsLoading}
                  className="w-full border border-gray-300 hover:border-gray-400 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 transition bg-white"
                >
                  <option value="">
                    {productsLoading ? "Cargando productos..." : "-- Selecciona un producto --"}
                  </option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.name} - ${producto.price}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddProduct}
                disabled={!selectedProductId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>

            {/* Lista de productos agregados */}
            <div className="space-y-2">
              {fields.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No hay productos agregados aún</p>
                </div>
              ) : (
                fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-md"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800">
                        {field.snapshotName}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">Cantidad:</label>
                          <input
                            {...register(`items.${index}.quantity` as const, {
                              min: 1,
                              valueAsNumber: true,
                            })}
                            type="number"
                            min="1"
                            step="1"
                            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600">Precio:</label>
                          <div className="relative w-24">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">
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
                              className="w-full border border-gray-300 rounded pl-5 pr-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ── Precios ────────────────────────────────────────────────────── */}
          <section className="bg-gray-50 rounded-md p-5 border border-gray-200 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              Precios
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Precio de promoción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Precio de promoción <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                    $
                  </span>
                  <input
                    {...register("promoPrice", {
                      required: "El precio de promoción es obligatorio",
                      min: { value: 0.01, message: "Debe ser mayor a 0" },
                    })}
                    type="number"
                    step="0.01"
                    min="0"
                    className={`w-full border rounded-md pl-7 pr-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 transition ${
                      errors.promoPrice
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.promoPrice && (
                  <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.promoPrice.message}
                  </p>
                )}
              </div>

              {/* Precio original */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Precio original <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                    $
                  </span>
                  <input
                    {...register("originalPrice", {
                      required: "El precio original es obligatorio",
                      min: { value: 0.01, message: "Debe ser mayor a 0" },
                    })}
                    type="number"
                    step="0.01"
                    min="0"
                    className={`w-full border rounded-md pl-7 pr-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 transition ${
                      errors.originalPrice
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.originalPrice && (
                  <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.originalPrice.message}
                  </p>
                )}
              </div>
            </div>

            {/* Descuento calculado */}
            {savings > 0 && (
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border ${
                  savings > 0
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <DollarSign className="w-4 h-4 flex-shrink-0" />
                Ahorran <span className="font-bold">${savings}</span> ({discountPercentage}%)
              </div>
            )}
          </section>

          {/* ── Inventario ─────────────────────────────────────────────────── */}
          <section className="bg-gray-50 rounded-md p-5 border border-gray-200 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              Inventario y Fechas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Stock de promociones
                </label>
                <input
                  {...register("stock", {
                    min: { value: 0, message: "Debe ser 0 o mayor" },
                  })}
                  type="number"
                  min="0"
                  step="1"
                  className={`w-full border rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 transition ${
                    errors.stock
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Ej: 50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cantidad de veces que se puede vender esta promoción
                </p>
              </div>

              {/* Estado */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    {...register("active")}
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Promoción activa
                  </span>
                </label>
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fecha de inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Fecha de inicio (opcional)
                </label>
                <input
                  {...register("startsAt")}
                  type="date"
                  className="w-full border border-gray-300 hover:border-gray-400 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 transition"
                />
              </div>

              {/* Fecha de fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Fecha de fin (opcional)
                </label>
                <input
                  {...register("endsAt")}
                  type="date"
                  className="w-full border border-gray-300 hover:border-gray-400 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 transition"
                />
              </div>
            </div>
          </section>

          {/* ── Botones ────────────────────────────────────────────────────── */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isLoading
                ? promotionEdit
                  ? "Actualizando..."
                  : "Guardando..."
                : promotionEdit
                ? "Actualizar Promoción"
                : "Guardar Promoción"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormPromotion;
