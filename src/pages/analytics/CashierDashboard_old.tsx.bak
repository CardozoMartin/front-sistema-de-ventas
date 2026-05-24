import DashboardRefined from "../../components/Dashboard/DashboardRefined";
import { useDashboardStats, useTopSellingProducts, useDashboardSocket } from "../../hooks/useDashboard";
import { formatCurrency } from "../../utils/formatCurrency";

// --- Formateadores
const fmt = (n: number) => formatCurrency(n);
const fmtN = (n: number) => Math.round(n).toLocaleString("es-AR");

// --- Componentes UI del Mockup
const Delta = ({ value, suffix = "%" }: { value: number; suffix?: string }) => {
  const up = value > 0;
  const zero = value === 0;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.04em",
        padding: "2px 7px",
        borderRadius: 2,
        background: zero ? "#f0f0f0" : up ? "#e8f5e9" : "#fdecea",
        color: zero ? "#888" : up ? "#2e7d32" : "#c62828",
      }}
    >
      {!zero && (up ? "↑" : "↓")} {Math.abs(Number(value.toFixed(1)))}{suffix}
    </span>
  );
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#999",
      marginBottom: 8,
      marginTop: 20,
    }}
  >
    {children}
  </div>
);

const HeroCard = ({ label, value, delta, sub, accent }: any) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #e8e8e8",
      borderLeft: accent ? `3px solid ${accent}` : "1px solid #e8e8e8",
      borderRadius: 4,
      padding: "16px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}
  >
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa" }}>
      {label}
    </div>
    <div style={{ fontSize: 26, fontWeight: 300, color: "#111", letterSpacing: "-0.02em", lineHeight: 1 }}>
      {value}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {delta !== undefined && delta !== null && <Delta value={delta} />}
      {sub && <span style={{ fontSize: 10, color: "#aaa" }}>{sub}</span>}
    </div>
  </div>
);

const MetaCell = ({ label, value, sub, danger, warn }: any) => (
  <div
    style={{
      background: "#f7f7f7",
      borderRadius: 4,
      padding: "10px 14px",
    }}
  >
    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#bbb", marginBottom: 4 }}>
      {label}
    </div>
    <div
      style={{
        fontSize: 16,
        fontWeight: 500,
        color: danger ? "#c62828" : warn ? "#bf6000" : "#111",
        letterSpacing: "-0.01em",
      }}
    >
      {value}
    </div>
    {sub && <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{sub}</div>}
  </div>
);

export default function CashierDashboard() {
  useDashboardSocket();

  const { data: stats, isLoading, error } = useDashboardStats("today", "session");
  const { data: topProducts } = useTopSellingProducts(5, "today", "session");

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><div className="spinner" /></div>;
  }
  if (error || !stats) {
    return <div className="p-8 text-center text-red-500">Error al cargar datos</div>;
  }

  // Usar el componente refinado en lugar del código largo
  return <DashboardRefined />;

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
            Mi Sesión Activa
          </div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>{currentDateStr}</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 500, padding: "4px 12px", borderRadius: 3, border: "1px solid #111", background: "#111", color: "#fff" }}>
            Hoy
          </div>
        </div>
      </div>

      {/* Alert Status de Caja */}
      {stats.isCashRegisterOpen ? (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderLeft: "3px solid #16a34a",
            borderRadius: 4,
            padding: "8px 14px",
            fontSize: 11,
            color: "#166534",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontWeight: 700 }}>Caja Abierta</span>
          <span style={{ color: "#86efac", fontSize: 10 }}>·</span>
          <span>
            Apertura: {fmt(stats.openingAmount)} · Efectivo actual esperado: <span style={{ fontWeight: 700 }}>{fmt(stats.currentBalance)}</span>
          </span>
        </div>
      ) : (
        <div
          style={{
            background: "#fffbf0",
            border: "1px solid #f0d080",
            borderLeft: "3px solid #d97706",
            borderRadius: 4,
            padding: "8px 14px",
            fontSize: 11,
            color: "#92400e",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontWeight: 700 }}>Caja Cerrada</span>
          <span style={{ color: "#fcd34d", fontSize: 10 }}>·</span>
          <span>Debes abrir la caja registradora para comenzar a vender.</span>
        </div>
      )}

      {/* Hero KPIs */}
      <SectionLabel>Mi rendimiento</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr)) minmax(0,1.1fr)", gap: 8, marginBottom: 8 }} className="max-lg:grid-cols-2 max-sm:grid-cols-1">
        <HeroCard
          label="Mis Ingresos"
          value={fmt(stats.todayRevenue)}
          delta={null}
          sub="efectivo + transf."
          accent="#16a34a"
        />
        <HeroCard
          label="Mis Ganancias"
          value={fmt(stats.todayProfit)}
          delta={null}
          sub={`margen real ${stats.profitMargin.toFixed(1)}%`}
          accent="#16a34a"
        />
        <HeroCard
          label="Mis Ventas"
          value={fmtN(stats.todaySales)}
          delta={null}
          sub="transacciones cobradas"
          accent="#16a34a"
        />

        {/* Payment panel */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: 4,
            padding: "16px 18px",
          }}
        >
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 12 }}>
            Método de pago
          </div>
          {pagos.map((p) => (
            <div key={p.label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555", marginBottom: 4 }}>
                <span>{p.label}</span>
                <span style={{ fontWeight: 600, color: "#111" }}>{p.ventas} · {p.pct}%</span>
              </div>
              <div style={{ height: 3, background: "#eee", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${p.pct}%`, height: "100%", background: p.color, borderRadius: 2 }} />
              </div>
            </div>
          ))}
          <div
            style={{
              marginTop: 12,
              padding: "8px 10px",
              background: "#fffbf0",
              border: "1px solid #f0d080",
              borderRadius: 3,
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#a07000" }}>
              Por cobrar · mis fiados
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: "#5a3c00", marginTop: 2 }}>
              {fmt(stats.pendingRevenue)}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8, marginBottom: 8 }} className="max-sm:grid-cols-1">
        <MetaCell label="Mi ticket promedio" value={fmt(stats.averageSaleValue)} sub="por venta (sin fiados)" />
        <MetaCell label="Costo de mis reposiciones" value={fmt(stats.replenishmentCost)} sub={`retenido en fiados ${fmt(stats.pendingReplenishmentCost)}`} />
      </div>

      {/* Bottom */}
      <SectionLabel>Detalle de productos vendidos</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
        {/* Product table */}
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 4, overflow: "hidden" }}>
          <div
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: "#111", letterSpacing: "-0.01em" }}>
              Mis Top Productos de la sesión
            </div>
            <div style={{ fontSize: 10, color: "#aaa" }}>
              {(topProducts || []).length} productos listados
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 400 }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["#", "Producto", "Uds.", "Ingreso", "Ganancia"].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#bbb",
                        padding: "6px 16px",
                        textAlign: i > 1 ? "right" : "left",
                        borderBottom: "1px solid #f0f0f0",
                        width: i === 0 ? 30 : i === 2 ? 60 : i >= 3 ? 100 : "auto",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(topProducts || []).map((p: any, idx: number) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: idx < (topProducts?.length || 0) - 1 ? "1px solid #f5f5f5" : "none" }}
                  >
                    <td style={{ padding: "9px 16px", fontSize: 11, color: "#ccc", fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ padding: "9px 16px", fontSize: 12, fontWeight: 500, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </td>
                    <td style={{ padding: "9px 16px", fontSize: 12, color: "#777", textAlign: "right" }}>{fmtN(p.quantity)}</td>
                    <td style={{ padding: "9px 16px", fontSize: 12, color: "#111", textAlign: "right", fontWeight: 500 }}>{fmt(p.revenue)}</td>
                    <td style={{ padding: "9px 16px", textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "#2e7d32",
                          background: "#e8f5e9",
                          padding: "2px 7px",
                          borderRadius: 2,
                        }}
                      >
                        +{fmt(p.profit)}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!topProducts || topProducts.length === 0) && (
                  <tr>
                    <td colSpan={5} style={{ padding: "20px", textAlign: "center", fontSize: 12, color: "#aaa" }}>
                      No tienes ventas en esta sesión aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
