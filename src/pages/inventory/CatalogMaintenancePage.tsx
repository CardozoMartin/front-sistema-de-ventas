import { useState, useMemo } from "react";
import { AlertTriangle, Clock, Package, Save, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useAllProductsNoPagination, useUpdateProduct, useRunCatalogMaintenance } from "../../hooks";
import type { Product } from "../../services/types";
import { formatCurrency } from "../../utils/formatCurrency";
import Swal from "../../utils/swalTheme";

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) => formatCurrency(n);
const fmtN = (n: number) => Math.round(n).toLocaleString("es-AR");

const getIncompleteReason = (p: Product) => {
  if (!p.costPrice || p.costPrice <= 0) return 'Sin Costo';
  if (p.price < (p.costPrice || 0)) return 'Margen Negativo';
  if (!p.category || p.category.trim() === '') return 'Sin Categoría';
  return 'Incompleto';
};

const CATEGORIES = [
  "Despensa", "Bebida", "Panadería", "Lácteos", "Carnicería",
  "Verdulería", "Limpieza", "Perfumería", "Snacks", "Congelados", "Otros",
];

const categoryOptions = CATEGORIES.reduce((acc, cat) => {
  acc[cat] = cat;
  return acc;
}, {} as Record<string, string>);

// ── Componentes UI ─────────────────────────────────────────────────────────────

const StatCard = ({ 
  icon, 
  count, 
  label, 
  color, 
  active, 
  onClick 
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      background: active ? `${color}15` : "#fff",
      border: `1px solid ${active ? color : "#e8e8e8"}`,
      borderRadius: 4,
      padding: "10px 12px",
      display: "flex",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
      transition: "all 0.2s",
      width: "100%",
    }}
    onMouseEnter={(e) => {
      if (!active) {
        e.currentTarget.style.borderColor = color + "40";
        e.currentTarget.style.background = color + "08";
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        e.currentTarget.style.borderColor = "#e8e8e8";
        e.currentTarget.style.background = "#fff";
      }
    }}
  >
    <div
      style={{
        background: color + "20",
        color: color,
        borderRadius: 3,
        padding: 6,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ textAlign: "left" }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: "#111", lineHeight: 1 }}>
        {fmtN(count)}
      </div>
      <div style={{ fontSize: 9, color: "#777", marginTop: 1 }}>
        {label}
      </div>
    </div>
  </button>
);

const ProductRow = ({ 
  product, 
  onQuickFix 
}: { 
  product: Product; 
  onQuickFix: (product: Product, updates: Partial<Product>) => void;
}) => {
  const hasNoCost = !product.costPrice || product.costPrice <= 0;
  const hasNegativeMargin = product.costPrice && product.costPrice > 0 && product.price < product.costPrice;
  const hasNoCategory = !product.category || product.category.trim() === '';
  const needsReview = product.status === 'pendiente_revision' || product.status === 'sin_movimiento';

  return (
    <div
      style={{
        padding: "10px 14px",
        borderBottom: "1px solid #f0f0f0",
        background: "#fff",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#fafafa";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#fff";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header con status y código */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "1px 4px",
                borderRadius: 2,
                background: 
                  product.status === 'incompleto' ? '#fdecea' : 
                  product.status === 'sin_movimiento' ? '#fff8f0' : '#fffbf0',
                color: 
                  product.status === 'incompleto' ? '#c62828' : 
                  product.status === 'sin_movimiento' ? '#bf6000' : '#a07000',
              }}
            >
              {product.status === 'incompleto' ? getIncompleteReason(product) : product.status.replace('_', ' ')}
            </span>
            <span style={{ fontSize: 8, color: "#aaa" }}>
              #{product.code}
            </span>
          </div>

          {/* Nombre del producto */}
          <div style={{ fontSize: 12, fontWeight: 600, color: "#111", marginBottom: 3 }}>
            {product.name}
          </div>

          {/* Métricas compactas */}
          <div style={{ display: "flex", gap: 12, fontSize: 10, color: "#666" }}>
            <span>
              Venta: <strong style={{ color: hasNegativeMargin ? "#c62828" : "#111" }}>
                {fmt(product.price)}
              </strong>
            </span>
            <span>
              Costo: <strong style={{ color: hasNoCost ? "#c62828" : "#111" }}>
                {fmt(product.costPrice || 0)}
              </strong>
            </span>
            <span>
              Stock: <strong style={{ color: "#111" }}>
                {fmtN(product.stock)}
              </strong>
            </span>
            <span>
              Cat: <strong style={{ color: hasNoCategory ? "#c62828" : "#111" }}>
                {product.category || 'Ninguna'}
              </strong>
            </span>
          </div>
        </div>

        {/* Acciones compactas */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          {hasNoCost && (
            <button
              onClick={() => {
                Swal.fire({
                  title: 'Corregir Costo',
                  input: 'number',
                  inputLabel: 'Nuevo Precio de Costo ($)',
                  inputValue: product.costPrice || 0,
                  showCancelButton: true,
                  confirmButtonText: 'Guardar',
                }).then(res => {
                  if (res.isConfirmed && res.value) {
                    onQuickFix(product, { costPrice: Number(res.value) });
                  }
                });
              }}
              style={{
                padding: "4px 8px",
                fontSize: 9,
                fontWeight: 500,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 3,
                color: "#666",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Save className="w-3 h-3" />
              Costo
            </button>
          )}

          {hasNegativeMargin && (
            <button
              onClick={() => {
                Swal.fire({
                  title: 'Corregir Venta',
                  input: 'number',
                  inputLabel: `Costo actual: ${fmt(product.costPrice || 0)}. Nuevo Precio de Venta ($):`,
                  inputValue: product.price,
                  showCancelButton: true,
                  confirmButtonText: 'Guardar',
                }).then(res => {
                  if (res.isConfirmed && res.value) {
                    onQuickFix(product, { price: Number(res.value) });
                  }
                });
              }}
              style={{
                padding: "4px 8px",
                fontSize: 9,
                fontWeight: 500,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 3,
                color: "#666",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Save className="w-3 h-3" />
              Precio
            </button>
          )}

          {hasNoCategory && !hasNoCost && !hasNegativeMargin && (
            <button
              onClick={() => {
                Swal.fire({
                  title: 'Asignar Categoría',
                  input: 'select',
                  inputOptions: categoryOptions,
                  inputPlaceholder: 'Selecciona una categoría',
                  showCancelButton: true,
                  confirmButtonText: 'Guardar',
                }).then(res => {
                  if (res.isConfirmed && res.value) {
                    onQuickFix(product, { category: res.value });
                  }
                });
              }}
              style={{
                padding: "4px 8px",
                fontSize: 9,
                fontWeight: 500,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 3,
                color: "#666",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Save className="w-3 h-3" />
              Categoría
            </button>
          )}

          {needsReview && (
            <button
              onClick={() => onQuickFix(product, {})}
              style={{
                padding: "4px 8px",
                fontSize: 9,
                fontWeight: 500,
                background: "#e8f5e9",
                border: "1px solid #c8e6c9",
                borderRadius: 3,
                color: "#2e7d32",
                cursor: "pointer",
              }}
            >
              ✓ Activar
            </button>
          )}

          <button
            onClick={() => onQuickFix(product, { status: 'oculto' })}
            title="Ocultar producto"
            style={{
              padding: "4px 6px",
              fontSize: 9,
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 3,
              color: "#aaa",
              cursor: "pointer",
            }}
          >
            <EyeOff className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Componente Principal ──────────────────────────────────────────────────────

export default function CatalogMaintenanceRefined() {
  const { data: allProducts, isLoading } = useAllProductsNoPagination();
  const updateProduct = useUpdateProduct();
  const runMaintenance = useRunCatalogMaintenance();

  const [filterType, setFilterType] = useState<"incompleto" | "sin_movimiento" | "pendiente_revision" | "all">("all");

  const problemProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter(p => p.status === 'incompleto' || p.status === 'sin_movimiento' || p.status === 'pendiente_revision');
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    if (filterType === "all") return problemProducts;
    return problemProducts.filter(p => p.status === filterType);
  }, [problemProducts, filterType]);

  const countIncompleto = useMemo(() => problemProducts.filter(p => p.status === 'incompleto').length, [problemProducts]);
  const countSinMovimiento = useMemo(() => problemProducts.filter(p => p.status === 'sin_movimiento').length, [problemProducts]);
  const countPendiente = useMemo(() => problemProducts.filter(p => p.status === 'pendiente_revision').length, [problemProducts]);

  const handleQuickFix = (product: Product, updates: Partial<Product>) => {
    updateProduct.mutate(
      { id: product.id, data: { ...updates, status: 'activo' } },
      {
        onSuccess: () => Swal.fire("Corregido", "El producto ha sido actualizado.", "success"),
        onError: () => Swal.fire("Error", "No se pudo actualizar.", "error")
      }
    );
  };

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
        background: "#f4f4f2",
        minHeight: "100vh",
        padding: "20px 24px",
      }}
    >
      {/* Header compacto */}
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
            Salud del Catálogo
          </div>
          <div style={{ fontSize: 10, color: "#aaa", marginTop: 1 }}>
            Revisa y corrige productos con problemas para mantener el inventario limpio
          </div>
        </div>
        <button
          onClick={() => {
            runMaintenance.mutate(undefined, {
              onSuccess: () => Swal.fire('¡Listo!', 'El escaneo del catálogo finalizó con éxito.', 'success'),
              onError: () => Swal.fire('Error', 'No se pudo escanear el catálogo.', 'error')
            });
          }}
          disabled={runMaintenance.isPending}
          style={{
            padding: "6px 12px",
            background: "#111",
            border: "1px solid #111",
            borderRadius: 3,
            fontSize: 10,
            fontWeight: 600,
            color: "#fff",
            cursor: runMaintenance.isPending ? "not-allowed" : "pointer",
            opacity: runMaintenance.isPending ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <RefreshCw className={`w-3 h-3 ${runMaintenance.isPending ? 'animate-spin' : ''}`} />
          {runMaintenance.isPending ? 'Escaneando...' : 'Escanear'}
        </button>
      </div>

      {/* Métricas compactas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8, marginBottom: 16 }}>
        <StatCard
          icon={<AlertTriangle className="w-4 h-4" />}
          count={countIncompleto}
          label="Incompletos"
          color="#c62828"
          active={filterType === "incompleto"}
          onClick={() => setFilterType("incompleto")}
        />
        <StatCard
          icon={<Package className="w-4 h-4" />}
          count={countSinMovimiento}
          label="Sin movimiento"
          color="#bf6000"
          active={filterType === "sin_movimiento"}
          onClick={() => setFilterType("sin_movimiento")}
        />
        <StatCard
          icon={<Clock className="w-4 h-4" />}
          count={countPendiente}
          label="Pendientes"
          color="#a07000"
          active={filterType === "pendiente_revision"}
          onClick={() => setFilterType("pendiente_revision")}
        />
      </div>

      {/* Lista de productos */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8e8e8",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        {/* Header de la lista */}
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid #f0f0f0",
            background: "#fafafa",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: "#111" }}>
            {filterType === 'all' ? 'Todos los problemas' : 
             filterType === 'incompleto' ? 'Productos Incompletos' :
             filterType === 'sin_movimiento' ? 'Stock estancado' : 'Requieren revisión'}
            <span style={{ fontSize: 9, color: "#aaa", marginLeft: 8 }}>
              {fmtN(filteredProducts.length)} productos
            </span>
          </div>
          {filterType !== 'all' && (
            <button
              onClick={() => setFilterType("all")}
              style={{
                fontSize: 9,
                color: "#666",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Ver todos
            </button>
          )}
        </div>

        {/* Contenido */}
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {isLoading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>
              <div style={{ display: "inline-block", width: 16, height: 16, border: "2px solid #ddd", borderTop: "2px solid #666", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
              <div style={{ marginTop: 8, fontSize: 10 }}>Cargando productos...</div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>
              <Package style={{ width: 32, height: 32, margin: "0 auto 8px", color: "#ccc" }} />
              <div style={{ fontSize: 12, fontWeight: 500, color: "#111", marginBottom: 4 }}>
                ¡Todo limpio!
              </div>
              <div style={{ fontSize: 10 }}>
                No hay productos en esta categoría.
              </div>
            </div>
          ) : (
            filteredProducts.map(product => (
              <ProductRow
                key={product.id}
                product={product}
                onQuickFix={handleQuickFix}
              />
            ))
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}