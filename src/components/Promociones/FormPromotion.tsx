import { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "../../utils/swalTheme.ts";
import { swalBackdrop, swalCustomClass } from "../../utils/swalTheme";
import { useCreatePromotion, useUpdatePromotion } from "../../hooks/usePromotions";
import { useProducts } from "../../hooks/useProducts";
import type { PromotionType } from "../../services/promotions.service";
import type { PromotionItem, CreatePromotionDto } from "../../services/promotions.service";

// ── Tipos ──────────────────────────────────────────────────────────────────────

const PROMOTION_TYPES: { value: PromotionType; label: string; description: string }[] = [
  { value: "bundle", label: "Bundle", description: "Combo de múltiples productos" },
  { value: "quantity", label: "Por Cantidad", description: "Descuento por cantidad" },
  { value: "mixed", label: "Mixto", description: "Combinación de bundle y cantidad" },
];

interface FormData extends CreatePromotionDto {
  items: PromotionItem[];
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
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
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
    {hint && !error && (
      <div style={{ marginTop: 4, fontSize: 10, color: "#999" }}>💡 {hint}</div>
    )}
    {error && (
      <div style={{ marginTop: 4, fontSize: 10, color: "#c62828", fontWeight: 500 }}>
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
    {sub && <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{sub}</div>}
  </div>
);

// ── Componente Principal ───────────────────────────────────────────────────────

export default function FormPromotion() {
  const navigate = useNavigate();
  const location = useLocation();
  const promotionEdit = location.state?.promotion ?? null;

  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [productSearch, setProductSearch] = useState("");
  const [isDropdownOpen, setIsOpenDropdown] = useState(false);

  const { data: productsData, isLoading: productsLoading } = useProducts({
    page: 1,
    limit: 1000,
  });
  const productos = useMemo(() => productsData?.products || [], [productsData]);

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

  const promoPrice = watch("promoPrice");
  const originalPrice = watch("originalPrice");
  const promotionType = watch("type");
  const itemsRaw = useWatch({ control, name: "items" });
  const items = useMemo(() => itemsRaw || [], [itemsRaw]);

  // Calcular originalPrice automáticamente
  useEffect(() => {
    const totalOriginal = items.reduce((acc, item) => {
      return acc + (item.snapshotPrice || 0) * (item.quantity || 1);
    }, 0);
    setValue("originalPrice", totalOriginal);
  }, [items, setValue]);

  const maxAllowedStock = useMemo(() => {
    if (items.length === 0) return 0;
    const stocks = items.map((item) => {
      const product = productos.find((p) => p.id === item.product);
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
    setProductSearch("");
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
          updatePromotion({ id: promotionEdit.id, data }, { onSuccess: handleSuccess });
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
          ✓ Promoción {promotionEdit ? "actualizada" : "creada"} exitosamente
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
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111", letterSpacing: "-0.01em" }}>
            {promotionEdit ? "Editar promoción" : "Nueva promoción"}
          </div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>
            {promotionEdit ? "Modificá los datos de la promoción" : "Creá un combo o descuento"}
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
          <div style={{ marginBottom: 16 }}>
            <InputField label="Nombre de la promoción" required error={errors.name?.message}>
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
                placeholder="Ej: 3 Tortillas por $1000"
              />
            </InputField>
          </div>

          <div style={{ marginBottom: 16 }}>
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

          <div>
            <label
              style={{
                display: "block",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#aaa",
                marginBottom: 8,
              }}
            >
              Tipo de promoción
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }}>
              {PROMOTION_TYPES.map((type) => (
                <label
                  key={type.value}
                  style={{
                    display: "flex",
                    alignItems: "start",
                    gap: 10,
                    padding: "12px 14px",
                    border: promotionType === type.value ? "2px solid #111" : "1px solid #e0e0e0",
                    borderRadius: 4,
                    background: promotionType === type.value ? "#fafafa" : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <input
                    {...register("type")}
                    type="radio"
                    value={type.value}
                    style={{
                      width: 16,
                      height: 16,
                      marginTop: 2,
                      accentColor: "#111",
                      cursor: "pointer",
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#111" }}>{type.label}</div>
                    <div style={{ fontSize: 10, color: "#777", marginTop: 2 }}>{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Productos */}
        <SectionLabel>Productos ({items.length})</SectionLabel>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: 4,
            padding: 16,
            marginBottom: 16,
          }}
        >
          {/* Buscador de productos */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, position: "relative" }}>
            <div style={{ flex: 1, position: "relative" }}>
              {selectedProductId ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    border: "1px solid #111",
                    borderRadius: 3,
                    background: "#fafafa",
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>
                    {productos.find((p) => p.id === selectedProductId)?.name} · $
                    {productos.find((p) => p.id === selectedProductId)?.price}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProductId("");
                      setProductSearch("");
                    }}
                    style={{
                      padding: "2px 6px",
                      fontSize: 11,
                      border: "none",
                      background: "transparent",
                      color: "#666",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
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
                    }}
                    placeholder={productsLoading ? "Cargando..." : "Buscá un producto..."}
                  />

                  {isDropdownOpen && productSearch.trim() && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: "100%",
                        marginTop: 4,
                        maxHeight: 240,
                        overflowY: "auto",
                        background: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: 4,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        zIndex: 50,
                      }}
                    >
                      {filteredProducts.length === 0 ? (
                        <div style={{ padding: "12px 16px", fontSize: 11, color: "#999", textAlign: "center" }}>
                          No se encontraron productos
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
                            style={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "10px 16px",
                              fontSize: 12,
                              border: "none",
                              borderBottom: "1px solid #f5f5f5",
                              background: "#fff",
                              color: "#111",
                              textAlign: "left",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f7f7f7";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#fff";
                            }}
                          >
                            <span style={{ fontWeight: 500 }}>{producto.name}</span>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                padding: "2px 8px",
                                background: "#f0f0f0",
                                borderRadius: 2,
                                color: "#555",
                              }}
                            >
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
              onClick={handleAddProduct}
              disabled={!selectedProductId}
              style={{
                padding: "10px 18px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.03em",
                border: "none",
                background: selectedProductId ? "#111" : "#ccc",
                color: "#fff",
                borderRadius: 3,
                cursor: selectedProductId ? "pointer" : "not-allowed",
              }}
            >
              + Agregar
            </button>
          </div>

          {/* Lista de productos agregados */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {fields.length === 0 ? (
              <div
                style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  border: "1px dashed #ddd",
                  borderRadius: 4,
                  background: "#fafafa",
                }}
              >
                <div style={{ fontSize: 11, color: "#999", fontWeight: 500 }}>
                  No hay productos agregados aún
                </div>
              </div>
            ) : (
              fields.map((field, index) => (
                <div
                  key={field.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    border: "1px solid #e8e8e8",
                    borderRadius: 4,
                    background: "#fafafa",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#111", marginBottom: 8 }}>
                      {field.snapshotName}
                    </div>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <label
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#aaa",
                          }}
                        >
                          Cantidad:
                        </label>
                        <input
                          {...register(`items.${index}.quantity` as const, {
                            min: 1,
                            valueAsNumber: true,
                          })}
                          type="number"
                          min="1"
                          step="1"
                          style={{
                            width: 60,
                            padding: "6px 8px",
                            fontSize: 12,
                            fontWeight: 600,
                            border: "1px solid #e0e0e0",
                            borderRadius: 3,
                            background: "#fff",
                            color: "#111",
                            outline: "none",
                          }}
                        />
                      </div>
                      <div style={{ fontSize: 11, color: "#777" }}>
                        Precio: <span style={{ fontWeight: 600, color: "#111" }}>${field.snapshotPrice}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    style={{
                      padding: "8px 10px",
                      fontSize: 11,
                      border: "1px solid #fdd",
                      background: "#fff8f8",
                      color: "#c62828",
                      borderRadius: 3,
                      cursor: "pointer",
                    }}
                  >
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Precios */}
        <SectionLabel>Precios</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0,1fr))",
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
            <InputField label="Precio de promoción" required error={errors.promoPrice?.message}>
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
                  {...register("promoPrice", {
                    required: "El precio de promoción es obligatorio",
                    min: { value: 0.01, message: "Debe ser mayor a 0" },
                    valueAsNumber: true,
                  })}
                  type="number"
                  step="0.01"
                  min="0"
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 28px",
                    fontSize: 14,
                    fontWeight: 600,
                    border: errors.promoPrice ? "1px solid #c62828" : "1px solid #e0e0e0",
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
            <InputField
              label="Precio original"
              hint="Calculado automáticamente"
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
                  {...register("originalPrice", { valueAsNumber: true })}
                  type="number"
                  readOnly
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 28px",
                    fontSize: 14,
                    fontWeight: 600,
                    border: "1px solid #e0e0e0",
                    borderRadius: 3,
                    background: "#f0f0f0",
                    color: "#666",
                    outline: "none",
                    cursor: "not-allowed",
                  }}
                  placeholder="0.00"
                />
              </div>
            </InputField>
          </div>
        </div>

        {/* Descuento calculado */}
        {savings > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0,1fr))",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <MetricCard label="Ahorro" value={fmt(savings)} accent="#2e7d32" />
            <MetricCard label="Descuento" value={`${discountPercentage}%`} sub="sobre precio original" />
          </div>
        )}

        {/* Inventario y fechas */}
        <SectionLabel>Inventario y vigencia</SectionLabel>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: 4,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16, marginBottom: 16 }}>
            <InputField
              label="Stock de promociones"
              hint={`Máximo posible: ${maxAllowedStock}`}
              error={errors.stock?.message}
            >
              <input
                {...register("stock", {
                  min: { value: 0, message: "Debe ser 0 o mayor" },
                  max: {
                    value: maxAllowedStock,
                    message: `Máximo permitido: ${maxAllowedStock}`,
                  },
                  valueAsNumber: true,
                })}
                type="number"
                min="0"
                max={maxAllowedStock}
                step="1"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: 12,
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

            <div style={{ display: "flex", alignItems: "end" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  width: "100%",
                  border: "1px solid #e0e0e0",
                  borderRadius: 3,
                  background: "#fafafa",
                  cursor: "pointer",
                }}
              >
                <input
                  {...register("active")}
                  type="checkbox"
                  style={{
                    width: 18,
                    height: 18,
                    accentColor: "#111",
                    cursor: "pointer",
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>
                  Promoción activa
                </span>
              </label>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16 }}>
            <InputField label="Fecha de inicio (opcional)">
              <input
                {...register("startsAt")}
                type="date"
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
                }}
              />
            </InputField>

            <InputField label="Fecha de fin (opcional)">
              <input
                {...register("endsAt")}
                type="date"
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
                }}
              />
            </InputField>
          </div>
        </div>

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
              : promotionEdit
              ? "Actualizar promoción"
              : "Crear promoción"}
          </button>
        </div>
      </form>
    </div>
  );
}
