import {
  AlertCircle,
  Save,
  X,
  Package,
  DollarSign,
  Tag,
  Ruler,
  Hash,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useCreateProduct, useUpdateProduct } from "../../hooks"; // ajusta según tus hooks

// ── Tipos ──────────────────────────────────────────────────────────────────────

type UnitType = "kilogramo" | "unidad";

const UNIT_TYPES: { value: UnitType; label: string; icon: string; hint: string }[] = [
  {
    value: "unidad",
    label: "Unidad",
    icon: "📦",
    hint: "Ej: 5 → 5 unidades",
  },
  {
    value: "kilogramo",
    label: "Kilogramo",
    icon: "⚖️",
    hint: "Ej: 2.5 → 2,5 kg (= 2500 g)",
  },
];

const CATEGORIES = [
  "Despensa",
  "Bebida",
  "Panadería",
  "Lácteos",
  "Carnicería",
  "Verdulería",
  "Limpieza",
  "Perfumería",
  "Snacks",
  "Congelados",
  "Otros",
];

interface CreateProductCommand {
  name: string;
  code?: string;       // Campo del backend
  barcode: string;     // Campo del formulario
  price: number;
  costPrice?: number;
  stock: number;
  unitType?: UnitType;
  description?: string;
  category?: string;
}

// ── Componente ─────────────────────────────────────────────────────────────────

const FormProducto = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const productEdite = location.state?.product ?? null;

  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateProductCommand>({
    defaultValues: {
      name: "",
      barcode: "",
      description: "",
      category: "",
      price: 0,
      costPrice: 0,
      stock: 0,
      unitType: "unidad",
    },
  });

  // Hooks de mutación — ajusta los nombres según tus hooks reales
  const { mutate: createProduct, isPending: isCreating, isError: isCreateError, error: createError } =
    useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating, isError: isUpdateError } =
    useUpdateProduct();

  const isLoading = isCreating || isUpdating;

  // Prefill al editar
  useEffect(() => {
    if (productEdite) {
      reset({
        name: productEdite.name ?? "",
        barcode: productEdite.code ?? productEdite.barcode ?? "",  // Priorizar 'code' del backend
        description: productEdite.description ?? "",
        category: productEdite.category ?? "",
        price: productEdite.price ?? 0,
        costPrice: productEdite.costPrice ?? 0,
        stock: productEdite.stock ?? 0,
        unitType: productEdite.unitType ?? "unidad",
      });
    }
  }, [productEdite, reset]);

  // Valores observados
  const unitType = watch("unitType");
  const stock = watch("stock");
  const price = watch("price");
  const costPrice = watch("costPrice");

  // Margen de ganancia calculado en tiempo real
  const margin =
    costPrice && price && Number(costPrice) > 0
      ? (((Number(price) - Number(costPrice)) / Number(costPrice)) * 100).toFixed(1)
      : null;

  // Conversión de stock para kg
  const stockDisplay =
    unitType === "kilogramo" && stock && Number(stock) > 0
      ? `= ${(Number(stock) * 1000).toLocaleString("es-AR")} gramos`
      : null;

  // ── Submit ───────────────────────────────────────────────────────────────────

  const buildPayload = (data: CreateProductCommand): CreateProductCommand => {
    const payload: CreateProductCommand = {
      name: data.name.trim(),
      code: data.barcode.trim(),        // El backend usa 'code'
      barcode: data.barcode.trim(),     // Mantener barcode también
      price: Number(data.price),
      stock: Number(data.stock),
    };

    if (data.costPrice && Number(data.costPrice) > 0)
      payload.costPrice = Number(data.costPrice);
    if (data.unitType) payload.unitType = data.unitType;
    if (data.description?.trim()) payload.description = data.description.trim();
    if (data.category) payload.category = data.category;

    return payload;
  };

  const handleSuccess = () => {
    setShowSuccess(true);
    reset();
    setTimeout(() => {
      setShowSuccess(false);
      navigate("/dashboard/productos");
    }, 2000);
  };

  const onSubmit = (data: CreateProductCommand) => {
    const payload = buildPayload(data);

    if (productEdite) {
      Swal.fire({
        title: "¿Actualizar producto?",
        text: "Se guardarán los cambios realizados",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, actualizar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          updateProduct(
            { id: productEdite.id, data: payload },
            { onSuccess: handleSuccess }
          );
        }
      });
    } else {
      createProduct(payload, { onSuccess: handleSuccess });
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
        navigate("/dashboard/productos");
      }
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">

      {/* Toast de éxito */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50 flex items-center gap-3 animate-pulse">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Producto {productEdite ? "actualizado" : "creado"} exitosamente
          </span>
        </div>
      )}

      {/* Toast de error */}
      {(isCreateError || isUpdateError) && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50 max-w-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error al guardar</p>
              <p className="text-xs text-red-600 mt-1">
                {(createError as any)?.response?.data?.message ??
                  "Ocurrió un error inesperado"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-md border border-gray-500/30 p-6 max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {productEdite ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {productEdite
                ? "Modificá los datos del producto"
                : "Completá la información para registrar el producto"}
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
                placeholder="Ej: Leche entera La Serenísima 1L"
              />
              {errors.name && (
                <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name.message}
                </p>
              )}
            </div>
               {/* Codigo de Barras */}

               <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-400" />
                Codigo de Barras <span className="text-red-500">*</span>
              </label>
              <input
                {...register("barcode", {
                  required: "El código de barras es obligatorio",
                  maxLength: { value: 200, message: "Máximo 200 caracteres" },
                })}
                className={`w-full border rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 transition ${
                  errors.barcode
                    ? "border-red-400 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                placeholder="Ej: 7790001234567"
              />
              {errors.barcode && (
                <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.barcode.message}
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
                placeholder="Detalles adicionales del producto (opcional)"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-gray-400" />
                Categoría
              </label>
              <select
                {...register("category")}
                className="w-full border border-gray-300 hover:border-gray-400 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 transition bg-white"
              >
                <option value="">-- Sin categoría --</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* ── Precios ────────────────────────────────────────────────────── */}
          <section className="bg-gray-50 rounded-md p-5 border border-gray-200 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              Precios
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Precio de venta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Precio de venta <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                    $
                  </span>
                  <input
                    {...register("price", {
                      required: "El precio de venta es obligatorio",
                      min: { value: 0.01, message: "Debe ser mayor a 0" },
                    })}
                    type="number"
                    step="0.01"
                    min="0"
                    className={`w-full border rounded-md pl-7 pr-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 transition ${
                      errors.price
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* Precio de costo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Precio de costo
                  <span className="ml-1 text-xs text-gray-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                    $
                  </span>
                  <input
                    {...register("costPrice", {
                      min: { value: 0, message: "Debe ser 0 o mayor" },
                    })}
                    type="number"
                    step="0.01"
                    min="0"
                    className={`w-full border rounded-md pl-7 pr-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 transition ${
                      errors.costPrice
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.costPrice && (
                  <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.costPrice.message}
                  </p>
                )}
              </div>
            </div>

            {/* Margen calculado */}
            {margin !== null && (
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border ${
                  Number(margin) >= 0
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <ShoppingCart className="w-4 h-4 flex-shrink-0" />
                Margen de ganancia:{" "}
                <span className="font-bold">{margin}%</span>
                {Number(margin) < 0 && (
                  <span className="text-xs ml-1">(vendés por debajo del costo)</span>
                )}
              </div>
            )}
          </section>

          {/* ── Inventario ─────────────────────────────────────────────────── */}
          <section className="bg-gray-50 rounded-md p-5 border border-gray-200 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Ruler className="w-4 h-4 text-gray-500" />
              Inventario
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Unidad de medida */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad de medida
                </label>
                <div className="flex gap-2">
                  {UNIT_TYPES.map((unit) => (
                    <label
                      key={unit.value}
                      className={`flex-1 flex flex-col items-center gap-1 p-3 border rounded-md cursor-pointer transition text-center text-sm font-medium ${
                        unitType === unit.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      <input
                        {...register("unitType")}
                        type="radio"
                        value={unit.value}
                        className="sr-only"
                      />
                      <span className="text-xl">{unit.icon}</span>
                      <span>{unit.label}</span>
                    </label>
                  ))}
                </div>
                {unitType && (
                  <p className="text-xs text-gray-500 mt-2 px-1">
                    💡 {UNIT_TYPES.find((u) => u.value === unitType)?.hint}
                  </p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {productEdite ? "Stock actual" : "Stock inicial"}{" "}
                  <span className="text-red-500">*</span>
                  {unitType && (
                    <span className="ml-1.5 inline-block px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-semibold">
                      {unitType === "kilogramo" ? "kg" : "uds"}
                    </span>
                  )}
                </label>
                <input
                  {...register("stock", {
                    required: "El stock es obligatorio",
                    min: { value: 0, message: "Debe ser 0 o mayor" },
                  })}
                  type="number"
                  step={unitType === "kilogramo" ? "0.001" : "1"}
                  min="0"
                  className={`w-full border rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400 transition ${
                    errors.stock
                      ? "border-red-400 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder={unitType === "kilogramo" ? "Ej: 2.5" : "Ej: 10"}
                />
                {errors.stock && (
                  <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.stock.message}
                  </p>
                )}
                {/* Conversión en tiempo real para kg */}
                {stockDisplay && (
                  <p className="flex items-center gap-1.5 text-xs text-blue-700 mt-2 p-2 bg-blue-50 border border-blue-200 rounded font-medium">
                    🔄 {stock} kg {stockDisplay}
                  </p>
                )}
                {productEdite && (
                  <p className="text-xs text-amber-600 mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded">
                    ⚠️ Modificá solo si necesitás ajustar el stock manualmente
                  </p>
                )}
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
                ? productEdite
                  ? "Actualizando..."
                  : "Guardando..."
                : productEdite
                ? "Actualizar Producto"
                : "Guardar Producto"}
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

export default FormProducto;