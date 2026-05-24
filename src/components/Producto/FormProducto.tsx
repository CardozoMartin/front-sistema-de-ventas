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

// ── Tipos ──────────────────────────────────────────────────────────────────────

type UnitType = "kilogramo" | "unidad";

const UNIT_TYPES: { value: UnitType; label: string }[] = [
  { value: "unidad", label: "Unidad" },
  { value: "kilogramo", label: "Kilogramo" },
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
  code?: string;
  barcode: string;
  price: number;
  costPrice?: number;
  stock: number;
  unitType?: UnitType;
  description?: string;
  category?: string;
}

// ── Utilidades de formato ──────────────────────────────────────────────────────

const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-AR");

// ── Componentes UI ─────────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#999",
      marginBottom: 12,
    }}
  >
    {children}
  </div>
);

const InputField = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label
      style={{
        display: "block",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#aaa",
        marginBottom: 6,
      }}
    >
      {label}
      {required && <span style={{ color: "#c62828", marginLeft: 4 }}>*</span>}
    </label>
    {children}
    {error && (
      <div
        style={{
          marginTop: 4,
          fontSize: 10,
          color: "#c62828",
          fontWeight: 500,
        }}
      >
        ⚠ {error}
      </div>
    )}
  </div>
);

const MetricCard = ({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) => (
  <div
    style={{
      background: "#f7f7f7",
      border: accent ? `2px solid ${accent}` : "1px solid #e8e8e8",
      borderRadius: 4,
      padding: "12px 16px",
    }}
  >
    <div
      style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#bbb",
        marginBottom: 4,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 20,
        fontWeight: 500,
        color: accent || "#111",
        letterSpacing: "-0.01em",
      }}
    >
      {value}
    </div>
    {sub && (
      <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{sub}</div>
    )}
  </div>
);

// ── Componente Principal ───────────────────────────────────────────────────────

export default function FormProducto() {
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
    values: productEdite
      ? {
          name: productEdite.name ?? "",
          barcode: productEdite.code ?? productEdite.barcode ?? "",
          description: productEdite.description ?? "",
          category: productEdite.category ?? "",
          price: productEdite.price ? Number(productEdite.price.toFixed(2)) : 0,
          costPrice: productEdite.costPrice
            ? Number(productEdite.costPrice.toFixed(2))
            : 0,
          stock: productEdite.stock ? Number(productEdite.stock.toFixed(3)) : 0,
          unitType: productEdite.unitType ?? "unidad",
        }
      : {
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

  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

  const isLoading = isCreating || isUpdating;

  // Watchers
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

  // ── Submit ───────────────────────────────────────────────────────────────────

  const buildPayload = (data: CreateProductCommand): any => {
    const payload: any = {
      name: data.name.trim().toLocaleUpperCase(),
      code: data.barcode.trim(),
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
    <div
      style={{
        fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
        background: "#f4f4f2",
        minHeight: "100vh",
        padding: "24px 28px",
      }}
    >
      {/* Toast de éxito */}
      {showSuccess && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            background: "#e8f5e9",
            border: "1px solid #c8e6c9",
            borderLeft: "3px solid #2e7d32",
            borderRadius: 4,
            padding: "12px 16px",
            fontSize: 12,
            color: "#1b5e20",
            fontWeight: 500,
            zIndex: 9999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          ✓ Producto {productEdite ? "actualizado" : "creado"} exitosamente
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#111",
              letterSpacing: "-0.01em",
            }}
          >
            {productEdite ? "Editar producto" : "Nuevo producto"}
          </div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>
            {productEdite
              ? "Modificá los datos del producto"
              : "Completá la información para registrar"}
          </div>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          style={{
            padding: "6px 12px",
            fontSize: 11,
            fontWeight: 500,
            border: "1px solid #ddd",
            background: "#fff",
            color: "#666",
            borderRadius: 3,
            cursor: "pointer",
            letterSpacing: "0.02em",
          }}
        >
          ✕ Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Información básica */}
        <SectionLabel>Información básica</SectionLabel>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: 4,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0,1fr))",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div style={{ gridColumn: "span 2" }}>
              <InputField
                label="Nombre del producto"
                required
                error={errors.name?.message}
              >
                <input
                  {...register("name", {
                    required: "El nombre es obligatorio",
                    maxLength: { value: 200, message: "Máximo 200 caracteres" },
                  })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: 12,
                    fontWeight: 500,
                    border: errors.name ? "1px solid #c62828" : "1px solid #e0e0e0",
                    borderRadius: 3,
                    background: "#fafafa",
                    color: "#111",
                    outline: "none",
                  }}
                  placeholder="Ej: Leche entera La Serenísima 1L"
                />
              </InputField>
            </div>

            <InputField
              label="Código de barras"
              required
              error={errors.barcode?.message}
            >
              <input
                {...register("barcode", {
                  required: "El código de barras es obligatorio",
                })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: "monospace",
                  border: errors.barcode ? "1px solid #c62828" : "1px solid #e0e0e0",
                  borderRadius: 3,
                  background: "#fafafa",
                  color: "#111",
                  outline: "none",
                }}
                placeholder="7790001234567"
              />
            </InputField>

            <InputField label="Categoría">
              <select
                {...register("category")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 12,
                  fontWeight: 500,
                  border: "1px solid #e0e0e0",
                  borderRadius: 3,
                  background: "#fafafa",
                  color: "#111",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="">-- Sin categoría --</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </InputField>
          </div>

          <InputField label="Descripción">
            <textarea
              {...register("description")}
              rows={2}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 12,
                fontWeight: 400,
                border: "1px solid #e0e0e0",
                borderRadius: 3,
                background: "#fafafa",
                color: "#111",
                outline: "none",
                resize: "none",
              }}
              placeholder="Detalles adicionales (opcional)"
            />
          </InputField>
        </div>

        {/* Tipo de unidad */}
        <SectionLabel>Tipo de unidad</SectionLabel>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: 4,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            {UNIT_TYPES.map((type) => (
              <label
                key={type.value}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  border:
                    watch("unitType") === type.value
                      ? "2px solid #111"
                      : "1px solid #e0e0e0",
                  borderRadius: 4,
                  background:
                    watch("unitType") === type.value ? "#fafafa" : "#fff",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <input
                  {...register("unitType")}
                  type="radio"
                  value={type.value}
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: "#111",
                    cursor: "pointer",
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: watch("unitType") === type.value ? "#111" : "#777",
                  }}
                >
                  {type.label}
                </span>
              </label>
            ))}
          </div>
          {unitType === "kilogramo" && (
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                background: "#fffbf0",
                border: "1px solid #f0d080",
                borderRadius: 3,
                fontSize: 10,
                color: "#a07000",
              }}
            >
              💡 Precio y costo en $/kg. En venta se pesa en gramos y se
              prorratea.
            </div>
          )}
        </div>

        {/* Precios y stock */}
        <SectionLabel>Precios e inventario</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0,1fr))",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e8e8",
              borderRadius: 4,
              padding: 16,
            }}
          >
            <InputField
              label="Precio de venta"
              required
              error={errors.price?.message}
            >
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#aaa",
                  }}
                >
                  $
                </span>
                <input
                  {...register("price", {
                    required: "El precio es obligatorio",
                    min: { value: 0.01, message: "Debe ser mayor a 0" },
                    valueAsNumber: true,
                  })}
                  type="number"
                  step="0.01"
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 28px",
                    fontSize: 14,
                    fontWeight: 600,
                    border: errors.price ? "1px solid #c62828" : "1px solid #e0e0e0",
                    borderRadius: 3,
                    background: "#fafafa",
                    color: "#111",
                    outline: "none",
                  }}
                  placeholder="0.00"
                />
              </div>
            </InputField>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e8e8",
              borderRadius: 4,
              padding: 16,
            }}
          >
            <InputField label="Costo" error={errors.costPrice?.message}>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#aaa",
                  }}
                >
                  $
                </span>
                <input
                  {...register("costPrice", {
                    min: { value: 0, message: "No puede ser negativo" },
                    valueAsNumber: true,
                  })}
                  type="number"
                  step="0.01"
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 28px",
                    fontSize: 14,
                    fontWeight: 600,
                    border: "1px solid #e0e0e0",
                    borderRadius: 3,
                    background: "#fafafa",
                    color: "#666",
                    outline: "none",
                  }}
                  placeholder="0.00"
                />
              </div>
            </InputField>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e8e8",
              borderRadius: 4,
              padding: 16,
            }}
          >
            <InputField
              label={`Stock ${unitType === "kilogramo" ? "(kg)" : "(unidades)"}`}
              required
              error={errors.stock?.message}
            >
              <input
                {...register("stock", {
                  required: "El stock es obligatorio",
                  min: { value: 0, message: "No puede ser negativo" },
                  valueAsNumber: true,
                })}
                type="number"
                step={unitType === "kilogramo" ? "0.001" : "1"}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 14,
                  fontWeight: 600,
                  border: errors.stock ? "1px solid #c62828" : "1px solid #e0e0e0",
                  borderRadius: 3,
                  background: "#fafafa",
                  color: "#111",
                  outline: "none",
                }}
                placeholder="0"
              />
            </InputField>
          </div>
        </div>

        {/* Métricas calculadas */}
        {pricingPreview && (
          <>
            <SectionLabel>Vista previa</SectionLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0,1fr))",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <MetricCard
                label="Ganancia unitaria"
                value={fmt(pricingPreview.profitPerUnit)}
                accent={pricingPreview.profitPerUnit > 0 ? "#2e7d32" : undefined}
              />
              <MetricCard
                label="Margen"
                value={`${margin}%`}
                sub={
                  Number(margin) > 30
                    ? "excelente"
                    : Number(margin) > 15
                    ? "bueno"
                    : "bajo"
                }
              />
              <MetricCard
                label="Ganancia total"
                value={fmt(pricingPreview.profitPerUnit * (stock || 0))}
              />
              <MetricCard
                label="Valor inventario"
                value={fmt((price || 0) * (stock || 0))}
              />
            </div>
          </>
        )}

        {/* Botones */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            paddingTop: 16,
            borderTop: "1px solid #e8e8e8",
          }}
        >
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: "10px 20px",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.03em",
              border: "1px solid #ddd",
              background: "#fff",
              color: "#666",
              borderRadius: 3,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "10px 24px",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.03em",
              border: "none",
              background: isLoading ? "#ccc" : "#111",
              color: "#fff",
              borderRadius: 3,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading
              ? "Guardando..."
              : productEdite
              ? "Actualizar producto"
              : "Crear producto"}
          </button>
        </div>
      </form>
    </div>
  );
}
