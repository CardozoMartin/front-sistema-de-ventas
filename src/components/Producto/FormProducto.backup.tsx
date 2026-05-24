import {
  AlertCircle,
  Save,
  X,
  Package,
  Tag,
  Hash,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "../../utils/swalTheme.ts";
import { useCreateProduct, useUpdateProduct } from "../../hooks";
import { swalBackdrop, swalCustomClass } from "../../utils/swalTheme";
import {
  analyzeProductPricing,
  normalizeWeightProductCost,
} from "../../utils/productPricing";
import { PricingSection } from "./PricingSection";
import { StockSection } from "./StockSection";

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
    hint: "Precio y costo en $/kg. En venta se pesa en gramos y se prorratea.",
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
    values: productEdite ? {
      name: productEdite.name ?? "",
      barcode: productEdite.code ?? productEdite.barcode ?? "",
      description: productEdite.description ?? "",
      category: productEdite.category ?? "",
      price: productEdite.price ? Number(productEdite.price.toFixed(2)) : 0,
      costPrice: productEdite.costPrice ? Number(productEdite.costPrice.toFixed(2)) : 0,
      stock: productEdite.stock ? Number(productEdite.stock.toFixed(3)) : 0,
      unitType: productEdite.unitType ?? "unidad",
    } : {
      name: "",
      barcode: "",
      description: "",
      category: "",
      price: 0,
      costPrice: 0,
      stock: 0,
      unitType: "unidad",
    }
  });

  // Hooks de mutación — ajusta los nombres según tus hooks reales
  const { mutate: createProduct, isPending: isCreating, isError: isCreateError, error: createError } =
    useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating, isError: isUpdateError } =
    useUpdateProduct();

  const isLoading = isCreating || isUpdating;

  // Watchers para calculos en tiempo real
  const unitType = watch("unitType");
  const stock = watch("stock");
  const price = watch("price");
  const costPrice = watch("costPrice");

  const pricingPreview =
    price && Number(price) > 0
      ? analyzeProductPricing({
          price: Number(price),
          costPrice: costPrice ? Number(costPrice) : 0,
          stock: stock ? Number(stock) : 0,
          unitType: unitType || "unidad",
        })
      : null;

  const margin =
    pricingPreview && Number(costPrice) > 0
      ? pricingPreview.marginPct.toFixed(1)
      : null;

  // Conversión de stock para kg
  const stockDisplay =
    unitType === "kilogramo" && stock && Number(stock) > 0
      ? `= ${(Number(stock) * 1000).toLocaleString("es-AR")} gramos`
      : null;

  // ── Submit ───────────────────────────────────────────────────────────────────

  const buildPayload = (data: CreateProductCommand): any => {
    const payload: any = {
      name: data.name.trim().toLocaleUpperCase(),
      code: data.barcode.trim(),        // El backend usa 'code'
      price: Number(data.price),
      stock: Number(data.stock),
    };

    if (data.unitType) payload.unitType = data.unitType;
    if (data.costPrice && Number(data.costPrice) > 0) {
      let cost = Number(data.costPrice);
      if (data.unitType === "kilogramo" && payload.stock > 0) {
        const normalized = normalizeWeightProductCost(
          "kilogramo",
          payload.price,
          cost,
          payload.stock
        );
        if (normalized !== undefined) cost = normalized;
      }
      payload.costPrice = cost;
    }
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
        confirmButtonText: "Sí, actualizar",
        cancelButtonText: "Cancelar",
        buttonsStyling: false,
        customClass: swalCustomClass,
        backdrop: swalBackdrop,
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
      confirmButtonText: "Sí, descartar",
      cancelButtonText: "Seguir editando",
      buttonsStyling: false,
      customClass: swalCustomClass,
      backdrop: swalBackdrop,
    }).then((result) => {
      if (result.isConfirmed) {
        reset();
        navigate("/dashboard/productos");
      }
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="w-full py-6">

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

      <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-6 sm:p-8 max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {productEdite ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {productEdite
                ? "Modificá los datos del producto"
                : "Completá la información para registrar el producto"}
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
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-slate-400" />
                Código de Barras <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("barcode", {
                  required: "El código de barras es obligatorio",
                  maxLength: { value: 200, message: "Máximo 200 caracteres" },
                })}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-neutral-500/50 transition-all font-medium text-sm ${
                  errors.barcode
                    ? "border-rose-400 focus:ring-rose-500/50"
                    : "border-slate-200"
                }`}
                placeholder="Ej: 7790001234567"
              />
              {errors.barcode && (
                <p className="flex items-center gap-1 text-rose-500 text-xs font-medium mt-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {errors.barcode.message}
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
                placeholder="Detalles adicionales del producto (opcional)"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-slate-400" />
                Categoría
              </label>
              <select
                {...register("category")}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-2 focus:ring-neutral-500/50 transition-all font-medium text-sm text-slate-700"
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
          <PricingSection
            register={register}
            errors={errors}
            unitType={unitType || "unidad"}
            margin={margin}
            pricingPreview={pricingPreview}
          />

          {/* ── Inventario ─────────────────────────────────────────────────── */}
          <StockSection
            register={register}
            errors={errors}
            unitType={unitType || "unidad"}
            stock={stock}
            stockDisplay={stockDisplay}
            productEdite={productEdite}
            UNIT_TYPES={UNIT_TYPES}
          />

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
              className="flex-1 flex justify-center items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-md shadow-sm transition-all focus:ring-2 focus:ring-neutral-900/50 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              <Save className="w-5 h-5" />
              {isLoading
                ? productEdite
                  ? "Actualizando..."
                  : "Guardando..."
                : productEdite
                ? "Actualizar Producto"
                : "Guardar Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormProducto;