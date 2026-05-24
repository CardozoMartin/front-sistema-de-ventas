import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAllProductsNoPagination } from "../../hooks";
import TableProduct from "../../components/Producto/TableProduct";
import ProductPriceSearch from "../../components/Producto/ProductPriceSearch";
import { filterProductsByStock, countProductsByStock } from "../../utils/stockFilter";
import type { StockFilterType } from "../../components/Producto/StockFilter";

// --- Formateadores y UI
const fmtN = (n: number) => Math.round(n).toLocaleString("es-AR");
const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-AR");

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#999", marginBottom: 8, marginTop: 20 }}>
    {children}
  </div>
);

const MetaCell = ({ label, value, sub, danger, warn }: any) => (
  <div style={{ background: "#f7f7f7", borderRadius: 4, padding: "10px 14px" }}>
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#bbb", marginBottom: 4 }}>
      {label}
    </div>
    <div style={{ fontSize: 16, fontWeight: 500, color: danger ? "#c62828" : warn ? "#bf6000" : "#111", letterSpacing: "-0.01em" }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{sub}</div>}
  </div>
);

const ProductosPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const location = useLocation();
  const queryStock = new URLSearchParams(location.search).get("stock") as StockFilterType | null;
  const [stockFilter, setStockFilter] = useState<StockFilterType>(queryStock ?? "all");
  const [activeTab, setActiveTab] = useState<"catalogo" | "analisis">("catalogo");

  const { data: allProducts, isLoading, error } = useAllProductsNoPagination();

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("stock") as StockFilterType | null;
    if (q) setStockFilter(q);
  }, [location.search]);

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    return filterProductsByStock(allProducts, stockFilter);
  }, [allProducts, stockFilter]);

  const stockCounts = useMemo(() => {
    if (!allProducts) return undefined;
    return countProductsByStock(allProducts);
  }, [allProducts]);

  const paginatedData = useMemo(() => {
    return {
      products: filteredProducts,
      pagination: {
        total: filteredProducts.length,
        page: 1,
        limit: filteredProducts.length,
        pages: 1,
      },
    };
  }, [filteredProducts]);

  const totalInversion = useMemo(() => {
    if (!allProducts) return 0;
    return allProducts.reduce((acc, p) => acc + (p.costPrice || 0) * p.stock, 0);
  }, [allProducts]);

  const currentDateStr = new Date().toLocaleDateString("es-AR", { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Inter', 'Helvetica Neue', Arial, sans-serif",
        background: "#f4f4f2",
        minHeight: "100%",
        padding: "24px 28px",
        overflowY: "auto"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111", letterSpacing: "-0.01em" }}>
            Gestión de Inventario
          </div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>{currentDateStr}</div>
        </div>
        <button
          onClick={() => navigate("/dashboard/productos/agregar")}
          style={{
            fontSize: 11,
            fontWeight: 500,
            padding: "6px 14px",
            borderRadius: 3,
            background: "#111",
            color: "#fff",
            cursor: "pointer",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          <Plus size={14} />
          Nuevo producto
        </button>
      </div>

      {error && (
        <div style={{ background: "#fff8f6", border: "1px solid #f5c4b3", borderLeft: "3px solid #c0392b", borderRadius: 4, padding: "8px 14px", fontSize: 11, color: "#711", marginBottom: 16 }}>
          Error al cargar productos: {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      {/* Hero Metrics */}
      <SectionLabel>Estado del inventario</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 8, marginBottom: 16 }} className="max-sm:grid-cols-2">
        <MetaCell label="Total Registrados" value={stockCounts?.total ? fmtN(stockCounts.total) : "0"} sub="productos en catálogo" />
        <MetaCell label="Inversión en Stock" value={fmt(totalInversion)} sub="basado en costo" />
        <MetaCell label="Stock Bajo" value={stockCounts?.lowStock ? fmtN(stockCounts.lowStock) : "0"} sub="requieren reposición" warn />
        <MetaCell label="Sin Stock" value={stockCounts?.noStock ? fmtN(stockCounts.noStock) : "0"} sub="ventas detenidas" danger />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        <button
          onClick={() => setActiveTab("catalogo")}
          style={{ fontSize: 11, fontWeight: 500, padding: "4px 12px", borderRadius: 3, border: "1px solid", borderColor: activeTab === "catalogo" ? "#111" : "#ddd", background: activeTab === "catalogo" ? "#111" : "#fff", color: activeTab === "catalogo" ? "#fff" : "#666", cursor: "pointer" }}
        >
          Catálogo y Stock
        </button>
        <button
          onClick={() => setActiveTab("analisis")}
          style={{ fontSize: 11, fontWeight: 500, padding: "4px 12px", borderRadius: 3, border: "1px solid", borderColor: activeTab === "analisis" ? "#111" : "#ddd", background: activeTab === "analisis" ? "#111" : "#fff", color: activeTab === "analisis" ? "#fff" : "#666", cursor: "pointer" }}
        >
          Análisis de Precios
        </button>
      </div>

      {/* Main Content */}
      <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 4, overflow: "hidden" }}>
        {activeTab === "catalogo" ? (
          <div>
            {/* Filters */}
            <div style={{ padding: "10px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="max-sm:flex-col max-sm:items-start max-sm:gap-4">
              <div style={{ fontSize: 11, fontWeight: 600, color: "#111", letterSpacing: "-0.01em" }}>
                Filtrar por disponibilidad
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => setStockFilter("all")}
                  style={{ fontSize: 10, padding: "3px 8px", borderRadius: 2, background: stockFilter === "all" ? "#f0f0f0" : "transparent", color: stockFilter === "all" ? "#111" : "#888", border: "none", cursor: "pointer" }}
                >
                  Todos ({stockCounts?.total || 0})
                </button>
                <button
                  onClick={() => setStockFilter("low-stock")}
                  style={{ fontSize: 10, padding: "3px 8px", borderRadius: 2, background: stockFilter === "low-stock" ? "#fff3e0" : "transparent", color: stockFilter === "low-stock" ? "#e65100" : "#888", border: "none", cursor: "pointer" }}
                >
                  Bajo Stock ({stockCounts?.lowStock || 0})
                </button>
                <button
                  onClick={() => setStockFilter("no-stock")}
                  style={{ fontSize: 10, padding: "3px 8px", borderRadius: 2, background: stockFilter === "no-stock" ? "#fdecea" : "transparent", color: stockFilter === "no-stock" ? "#c62828" : "#888", border: "none", cursor: "pointer" }}
                >
                  Sin Stock ({stockCounts?.noStock || 0})
                </button>
              </div>
            </div>

            <TableProduct
              productos={paginatedData}
              isLoading={isLoading}
              currentPage={page}
              onPageChange={setPage}
            />
          </div>
        ) : (
          <div style={{ padding: 16 }}>
            <ProductPriceSearch />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductosPage;
