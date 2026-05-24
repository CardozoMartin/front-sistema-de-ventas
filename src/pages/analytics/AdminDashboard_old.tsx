import { useState, useMemo } from "react";
import { useDashboardStats, useTopSellingProducts, useDashboardSocket } from "../../hooks/useDashboard";
import { useSales } from "../../hooks/useSales";
import { useCashRegisters } from "../../hooks/useCashRegister";
import { formatCurrency } from "../../utils/formatCurrency";
import { SellerSalesModal } from "../../components/Dashboard/SellerSalesModal";

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

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"hoy" | "semana" | "mes">("hoy");
  const periodForHook = selectedPeriod === "hoy" ? "today" : selectedPeriod === "semana" ? "week" : "month";
  const [selectedSeller, setSelectedSeller] = useState<{ id: string; name: string; sales: any[] } | null>(null);

  useDashboardSocket();

  const { data: stats, isLoading, error } = useDashboardStats(periodForHook, "global");
  const { data: topProducts } = useTopSellingProducts(5, periodForHook, "global");
  
  const { data: salesData } = useSales();
  const sales = Array.isArray(salesData) ? salesData : (salesData as any)?.sales || [];

  const { data: cashRegistersData } = useCashRegisters();
  const openRegisters = useMemo(() => {
    if (!cashRegistersData) return [];
    const registers = Array.isArray(cashRegistersData) ? cashRegistersData : (cashRegistersData as any)?.cashRegisters || [];
    return registers.filter((r: any) => r.status === 'abierta' || r.status === 'open');
  }, [cashRegistersData]);

  const filteredSales = useMemo(() => {
    if (!sales.length) return [];
    const now = new Date();
    if (selectedPeriod === 'hoy') {
      const todayStr = now.toDateString();
      return sales.filter((s: any) => new Date(s.createdAt).toDateString() === todayStr);
    } else {
      const cutoffDate = new Date();
      if (selectedPeriod === 'semana') cutoffDate.setDate(now.getDate() - 7);
      else if (selectedPeriod === 'mes') cutoffDate.setDate(1);
      cutoffDate.setHours(0, 0, 0, 0);
      return sales.filter((s: any) => new Date(s.createdAt) >= cutoffDate);
    }
  }, [sales, selectedPeriod]);

  const salesBySeller = useMemo(() => {
    if (!filteredSales.length) return [];
    
    const activeSellerIds = new Set(openRegisters.map((r: any) => String(r.user?._id || r.user?.id || r.user)));
    const sellerMap = new Map<string, { id: string, name: string, count: number, revenue: number }>();
    
    filteredSales.forEach((sale: any) => {
       if (sale.status === 'cancelado' || sale.paymentMethod === 'cuenta_corriente') return;
       const sellerId = String(sale.seller?._id || sale.seller?.id || sale.seller || 'Desconocido');
       if (!activeSellerIds.has(sellerId)) return;
       
       const sellerName = sale.seller?.name || sale.seller?.username || 'Desconocido';
       const existing = sellerMap.get(sellerId);
       if (existing) {
         existing.count += 1;
         existing.revenue += sale.total;
       } else {
         sellerMap.set(sellerId, { id: sellerId, name: sellerName, count: 1, revenue: sale.total });
       }
    });
    
    return Array.from(sellerMap.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredSales, openRegisters]);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><div className="spinner" /></div>;
  }
  if (error || !stats) {
    return <div className="p-8 text-center text-red-500">Error al cargar datos</div>;
  }

  // --- Mapeo de Pagos
  const totalPagos = stats.salesByPaymentMethod.efectivo + stats.salesByPaymentMethod.transferencia + stats.salesByPaymentMethod.cuentaCorriente;
  const getPct = (v: number) => totalPagos > 0 ? Math.round((v / totalPagos) * 100) : 0;
  const pagos = [
    { label: "Efectivo", ventas: stats.salesByPaymentMethod.efectivo, pct: getPct(stats.salesByPaymentMethod.efectivo), color: "#1a1a1a" },
    { label: "Transferencia", ventas: stats.salesByPaymentMethod.transferencia, pct: getPct(stats.salesByPaymentMethod.transferencia), color: "#aaa" },
    { label: "Cuenta corriente", ventas: stats.salesByPaymentMethod.cuentaCorriente, pct: getPct(stats.salesByPaymentMethod.cuentaCorriente), color: "#555" },
  ];

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
            Panel operativo
          </div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 1 }}>{currentDateStr}</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {(["hoy", "semana", "mes"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedPeriod(t)}
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: "4px 12px",
                borderRadius: 3,
                border: "1px solid",
                borderColor: selectedPeriod === t ? "#111" : "#ddd",
                background: selectedPeriod === t ? "#111" : "#fff",
                color: selectedPeriod === t ? "#fff" : "#666",
                cursor: "pointer",
                textTransform: "capitalize",
                letterSpacing: "0.02em",
                transition: "all 0.2s"
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Alert */}
      {(stats.outOfStockProducts > 0 || (stats.salesTrend !== null && stats.salesTrend < -20)) && (
        <div
          style={{
            background: "#fff8f6",
            border: "1px solid #f5c4b3",
            borderLeft: "3px solid #c0392b",
            borderRadius: 4,
            padding: "8px 14px",
            fontSize: 11,
            color: "#711",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontWeight: 700 }}>Atención</span>
          <span style={{ color: "#999", fontSize: 10 }}>·</span>
          <span>
            {stats.outOfStockProducts} productos sin stock · {stats.lowStockProducts} con stock bajo 
            {stats.salesTrend !== null && stats.salesTrend < -20 ? ` · Ventas caen ${Math.abs(Number(stats.salesTrend.toFixed(1)))}%` : ""}
          </span>
        </div>
      )}

      {/* Hero KPIs */}
      <SectionLabel>Resultado del período</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr)) minmax(0,1.1fr)", gap: 8, marginBottom: 8 }} className="max-lg:grid-cols-2 max-sm:grid-cols-1">
        <HeroCard
          label="Ingresos"
          value={fmt(stats.todayRevenue)}
          delta={stats.revenueTrend}
          sub="efectivo + transf."
          accent="#c0392b"
        />
        <HeroCard
          label="Ganancias"
          value={fmt(stats.todayProfit)}
          delta={stats.profitTrend}
          sub={`margen real ${stats.profitMargin.toFixed(1)}%`}
          accent="#c0392b"
        />
        <HeroCard
          label="Ventas"
          value={fmtN(stats.todaySales)}
          delta={stats.salesTrend}
          sub="transacciones cobradas"
          accent="#c0392b"
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
              Por cobrar · fiados
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: "#5a3c00", marginTop: 2 }}>
              {fmt(stats.pendingRevenue)}
            </div>
            <div style={{ fontSize: 9, color: "#a07000", marginTop: 2 }}>
              Gan. ret. {fmt(stats.pendingProfit)} · Costo ret. {fmt(stats.pendingReplenishmentCost)}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 8, marginBottom: 8 }} className="max-lg:grid-cols-2 max-sm:grid-cols-1">
        <MetaCell label="Ticket promedio" value={fmt(stats.averageSaleValue)} sub="sin fiados" />
        <MetaCell label="Costo reposición" value={fmt(stats.replenishmentCost)} sub={`ret. fiados ${fmt(stats.pendingReplenishmentCost)}`} warn />
        <MetaCell label="Valor stock total" value={fmt(stats.totalStockValue)} sub="inversión inventario" />
        <MetaCell
          label="Stock bajo / sin stock"
          value={`${fmtN(stats.lowStockProducts)} / ${fmtN(stats.outOfStockProducts)}`}
          sub={`de ${fmtN(stats.totalProducts)} productos`}
          danger
        />
      </div>

      {/* Bottom */}
      <SectionLabel>Detalle</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.9fr) minmax(0,1fr)", gap: 8 }} className="max-lg:grid-cols-1">
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
              Productos más vendidos
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
                      No hay datos suficientes en este período
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Vendedores */}
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid #f0f0f0", fontSize: 11, fontWeight: 600, color: "#111", letterSpacing: "-0.01em" }}>
              Vendedores Activos
            </div>
            {salesBySeller.map((v) => (
              <div 
                key={v.id} 
                onClick={() => {
                  const s = filteredSales.filter((sale: any) => String(sale.seller?._id || sale.seller?.id || sale.seller) === v.id);
                  setSelectedSeller({ id: v.id, name: v.name, sales: s });
                }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #fafafa" }}
                className="hover:bg-neutral-50"
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "#111",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    letterSpacing: "0.05em",
                    flexShrink: 0,
                  }}
                >
                  {v.name.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#111" }}>{v.name}</div>
                  <div style={{ fontSize: 10, color: "#aaa" }}>{v.count} ventas</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#111" }}>{fmt(v.revenue)}</div>
              </div>
            ))}
            {salesBySeller.length === 0 && (
              <div style={{ padding: "20px", textAlign: "center", fontSize: 12, color: "#aaa" }}>
                No hay ventas registradas
              </div>
            )}
          </div>

          {/* Inventario */}
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 4, overflow: "hidden", flex: 1 }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid #f0f0f0", fontSize: 11, fontWeight: 600, color: "#111", letterSpacing: "-0.01em" }}>
              Estado del Inventario
            </div>
            {[
              { label: "Productos registrados", value: fmtN(stats.totalProducts), style: {} },
              { label: "Stock bajo", value: fmtN(stats.lowStockProducts), style: { color: "#bf6000" } },
              { label: "Sin stock", value: fmtN(stats.outOfStockProducts), style: { color: "#c62828" } },
              { label: "Valor total (Inversión)", value: fmt(stats.totalStockValue), style: {} },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 16px",
                  borderBottom: "1px solid #f5f5f5",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "#777" }}>{row.label}</span>
                <span style={{ fontWeight: 600, color: "#111", ...row.style }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <SellerSalesModal 
        isOpen={!!selectedSeller}
        onClose={() => setSelectedSeller(null)}
        sellerName={selectedSeller?.name || ''}
        sales={selectedSeller?.sales || []}
      />
    </div>
  );
}
