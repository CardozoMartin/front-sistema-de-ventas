import {
  BarChart3,
  Download,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  RotateCcw,
  Percent,
  RefreshCw,
  Calendar,
  ArrowUpDown,
  FileSpreadsheet,
  AlertCircle,
  PieChart,
} from "lucide-react";
import { useState } from "react";
import { useReports } from "../../hooks/useReports";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, PieChart as RechartsPieChart, Cell
} from 'recharts';

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) => formatCurrency(n);
const fmtN = (n: number) => Math.round(n).toLocaleString("es-AR");

// ── Componentes UI ─────────────────────────────────────────────────────────────

const MetricCard = ({ 
  icon, 
  label, 
  value, 
  subtitle,
  color = "#111"
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  color?: string;
}) => (
  <div
    style={{
      background: "#fff",
      border: "1px solid #e8e8e8",
      borderRadius: 4,
      padding: "10px 12px",
      display: "flex",
      alignItems: "flex-start",
      gap: 8,
    }}
  >
    <div
      style={{
        background: color + "15",
        color: color,
        borderRadius: 3,
        padding: 6,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#111", lineHeight: 1, marginBottom: 2 }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: 9, color: "#777" }}>
          {subtitle}
        </div>
      )}
    </div>
  </div>
);

const TabButton = ({ 
  active, 
  icon: Icon, 
  label, 
  onClick 
}: {
  active: boolean;
  icon: React.ComponentType<any>;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      padding: "4px 12px",
      fontSize: 10,
      fontWeight: 500,
      borderRadius: 3,
      border: "1px solid",
      borderColor: active ? "#111" : "#ddd",
      background: active ? "#111" : "#fff",
      color: active ? "#fff" : "#666",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 4,
      transition: "all 0.2s",
    }}
  >
    <Icon className="w-3 h-3" />
    {label}
  </button>
);

const ProductRow = ({ 
  product, 
  index 
}: { 
  product: any; 
  index: number;
}) => (
  <div
    style={{
      padding: "6px 12px",
      borderBottom: "1px solid #f0f0f0",
      display: "flex",
      alignItems: "center",
      gap: 12,
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
    <div
      style={{
        width: 20,
        height: 20,
        background: "#f0f0f0",
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 9,
        fontWeight: 600,
        color: "#666",
        flexShrink: 0,
      }}
    >
      {index + 1}
    </div>
    
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: "#111", marginBottom: 1 }}>
        {product.productName}
      </div>
      <div style={{ fontSize: 9, color: "#777" }}>
        {product.unitType === 'kilogramo'
          ? `${product.quantitySold.toFixed(3)} kg`
          : `${fmtN(product.quantitySold)} u`
        }
      </div>
    </div>
    
    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 10 }}>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: 600, color: "#111" }}>{fmt(product.revenue)}</div>
        <div style={{ color: "#777", fontSize: 9 }}>Ingreso</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: 600, color: product.profit >= 0 ? "#2e7d32" : "#c62828" }}>
          {fmt(product.profit)}
        </div>
        <div style={{ color: "#777", fontSize: 9 }}>
          {product.revenue > 0 ? `${((product.profit / product.revenue) * 100).toFixed(1)}%` : '0%'}
        </div>
      </div>
    </div>
  </div>
);

// ── Componente Principal ──────────────────────────────────────────────────────

const ReportsPageRefined = () => {
  const {
    report,
    isLoading,
    error,
    refetch,
    preset,
    setPreset,
    customRange,
    setCustomRange,
    exportToCSV,
    formatDateForInput,
  } = useReports();

  const [sortField, setSortField] = useState<'profit' | 'revenue' | 'quantitySold'>('profit');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState<'products' | 'daily' | 'payments'>('products');

  if (isLoading) {
    return (
      <div
        style={{
          fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
          background: "#f4f4f2",
          minHeight: "100vh",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "inline-block", width: 24, height: 24, border: "2px solid #ddd", borderTop: "2px solid #666", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 12 }} />
          <div style={{ fontSize: 11, color: "#777" }}>Cargando reportes...</div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div
        style={{
          fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif",
          background: "#f4f4f2",
          minHeight: "100vh",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <AlertCircle style={{ width: 32, height: 32, color: "#c62828", margin: "0 auto 12px" }} />
          <div style={{ fontSize: 12, fontWeight: 500, color: "#111", marginBottom: 8 }}>
            Error al cargar los reportes
          </div>
          <button
            onClick={() => refetch()}
            style={{
              padding: "6px 16px",
              background: "#111",
              border: "1px solid #111",
              borderRadius: 3,
              fontSize: 10,
              fontWeight: 600,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const sortedProducts = [...report.productReports].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    return sortDir === 'desc' ? valB - valA : valA - valB;
  });

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
            Reportes
          </div>
          <div style={{ fontSize: 10, color: "#aaa", marginTop: 1 }}>
            Análisis financiero detallado de tu negocio
          </div>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => refetch()}
            style={{
              padding: 6,
              background: "#f7f7f7",
              border: "1px solid #e8e8e8",
              borderRadius: 3,
              color: "#666",
              cursor: "pointer",
            }}
            title="Actualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Filtros de período compactos */}
          <div style={{ display: "flex", gap: 3 }}>
            {(['today', 'week', 'month', 'custom'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                style={{
                  padding: "4px 10px",
                  fontSize: 9,
                  fontWeight: 500,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: preset === p ? "#111" : "#ddd",
                  background: preset === p ? "#111" : "#fff",
                  color: preset === p ? "#fff" : "#666",
                  cursor: "pointer",
                }}
              >
                {p === 'today' ? 'Hoy' : p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Custom'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rango personalizado */}
      {preset === 'custom' && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e8e8",
            borderRadius: 4,
            padding: "10px 14px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Calendar className="w-4 h-4" style={{ color: "#aaa" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10 }}>
            <span style={{ color: "#666" }}>Desde:</span>
            <input
              type="date"
              value={formatDateForInput(customRange.start)}
              onChange={(e) => {
                const d = new Date(e.target.value);
                d.setHours(0, 0, 0, 0);
                setCustomRange(prev => ({ ...prev, start: d }));
              }}
              style={{
                padding: "4px 8px",
                border: "1px solid #ddd",
                borderRadius: 3,
                fontSize: 10,
                background: "#fff",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10 }}>
            <span style={{ color: "#666" }}>Hasta:</span>
            <input
              type="date"
              value={formatDateForInput(customRange.end)}
              onChange={(e) => {
                const d = new Date(e.target.value);
                d.setHours(23, 59, 59, 999);
                setCustomRange(prev => ({ ...prev, end: d }));
              }}
              style={{
                padding: "4px 8px",
                border: "1px solid #ddd",
                borderRadius: 3,
                fontSize: 10,
                background: "#fff",
              }}
            />
          </div>
        </div>
      )}

      {/* Métricas compactas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0,1fr))", gap: 8, marginBottom: 16 }}>
        <MetricCard
          icon={<ShoppingCart className="w-4 h-4" />}
          label="Ventas"
          value={fmtN(report.totalSales)}
          subtitle="unidades vendidas"
        />
        <MetricCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Ingresos"
          value={fmt(report.totalRevenue)}
          subtitle="efectivo + transf."
          color="#2e7d32"
        />
        <MetricCard
          icon={<TrendingUp className="w-4 h-4" />}
          label="Ganancia"
          value={fmt(report.totalProfit)}
          subtitle={`margen ${report.profitMargin.toFixed(1)}%`}
          color="#2e7d32"
        />
        <MetricCard
          icon={<RotateCcw className="w-4 h-4" />}
          label="Reposición"
          value={fmt(report.replenishmentCost)}
          subtitle="para reponer vendido"
          color="#bf6000"
        />
        <MetricCard
          icon={<Percent className="w-4 h-4" />}
          label="Ticket Promedio"
          value={fmt(report.averageTicket)}
          subtitle="por venta"
        />
      </div>

      {/* Contenido principal */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8e8e8",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        {/* Tabs compactos */}
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
          <div style={{ display: "flex", gap: 6 }}>
            <TabButton
              active={activeTab === 'products'}
              icon={BarChart3}
              label="Productos"
              onClick={() => setActiveTab('products')}
            />
            <TabButton
              active={activeTab === 'daily'}
              icon={Calendar}
              label="Por Día"
              onClick={() => setActiveTab('daily')}
            />
            <TabButton
              active={activeTab === 'payments'}
              icon={DollarSign}
              label="Métodos de Pago"
              onClick={() => setActiveTab('payments')}
            />
          </div>

          <button
            onClick={() => exportToCSV(activeTab === 'payments' ? 'sales' : activeTab === 'daily' ? 'daily' : 'products')}
            style={{
              padding: "4px 10px",
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 3,
              fontSize: 9,
              fontWeight: 500,
              color: "#666",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Download className="w-3 h-3" />
            Exportar CSV
          </button>
        </div>

        {/* Contenido de tabs */}
        <div style={{ padding: "14px 14px", maxHeight: "60vh", overflowY: "auto" }}>
          
          {/* TAB: Productos */}
          {activeTab === 'products' && (
            <>
              {sortedProducts.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>
                  <FileSpreadsheet style={{ width: 32, height: 32, margin: "0 auto 8px", color: "#ccc" }} />
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#111", marginBottom: 4 }}>
                    No hay ventas
                  </div>
                  <div style={{ fontSize: 10 }}>
                    No hay datos para este período
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  
                  {/* Gráfico compacto */}
                  <div
                    style={{
                      background: "#fafafa",
                      border: "1px solid #f0f0f0",
                      borderRadius: 4,
                      padding: "12px",
                    }}
                  >
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb", marginBottom: 8 }}>
                      Top 10 Productos (Ingresos)
                    </div>
                    <div style={{ height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={sortedProducts.slice(0, 10)}
                          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="productName" 
                            tick={{ fontSize: 9, fill: '#aaa' }} 
                            tickFormatter={(val) => val.length > 12 ? val.substring(0, 12) + '...' : val}
                          />
                          <YAxis 
                            tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} 
                            tick={{ fontSize: 9, fill: '#aaa' }} 
                          />
                          <RechartsTooltip 
                            formatter={(value: any) => fmt(value)} 
                            labelStyle={{ fontSize: 10 }}
                            contentStyle={{ fontSize: 10, border: '1px solid #e8e8e8', borderRadius: 4 }}
                          />
                          <Bar dataKey="revenue" fill="#111" name="Ingresos" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="profit" fill="#666" name="Ganancia" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Lista de productos */}
                  <div
                    style={{
                      background: "#fafafa",
                      border: "1px solid #f0f0f0",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb", padding: "8px 12px", background: "#f0f0f0" }}>
                      Detalle de productos ({sortedProducts.length})
                    </div>
                    <div style={{ maxHeight: 300, overflowY: "auto" }}>
                      {sortedProducts.map((product, index) => (
                        <ProductRow key={product.productName} product={product} index={index} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB: Por día */}
          {activeTab === 'daily' && (
            <div
              style={{
                background: "#fafafa",
                border: "1px solid #f0f0f0",
                borderRadius: 4,
                padding: "12px",
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb", marginBottom: 8 }}>
                Ventas por día
              </div>
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={report.dailyReports}
                    margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 9, fill: '#aaa' }}
                      tickFormatter={(val) => new Date(val).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis 
                      tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} 
                      tick={{ fontSize: 9, fill: '#aaa' }} 
                    />
                    <RechartsTooltip 
                      formatter={(value: any) => fmt(value)}
                      labelFormatter={(val) => new Date(val).toLocaleDateString('es-AR')}
                      contentStyle={{ fontSize: 10, border: '1px solid #e8e8e8', borderRadius: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalRevenue" 
                      stroke="#111" 
                      strokeWidth={2} 
                      name="Ingresos"
                      dot={{ r: 3, fill: '#111' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalProfit" 
                      stroke="#2e7d32" 
                      strokeWidth={2} 
                      name="Ganancia"
                      dot={{ r: 3, fill: '#2e7d32' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB: Métodos de pago */}
          {activeTab === 'payments' && (
            <div
              style={{
                background: "#fafafa",
                border: "1px solid #f0f0f0",
                borderRadius: 4,
                padding: "12px",
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#bbb", marginBottom: 12 }}>
                Métodos de pago
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#666" }}>Efectivo</span>
                  <span style={{ fontWeight: 600, color: "#2e7d32" }}>
                    {fmt(report.paymentMethodReports.find(p => p.method === 'efectivo')?.total || 0)}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#666" }}>Transferencias</span>
                  <span style={{ fontWeight: 600, color: "#111" }}>
                    {fmt(report.paymentMethodReports.find(p => p.method === 'transferencia')?.total || 0)}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#666" }}>Fiado</span>
                  <span style={{ fontWeight: 600, color: "#c62828" }}>
                    {fmt(report.paymentMethodReports.find(p => p.method === 'cuenta_corriente')?.total || 0)}
                  </span>
                </div>
                <hr style={{ border: "none", borderTop: "1px solid #e8e8e8", margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, fontWeight: 600 }}>
                  <span style={{ color: "#111" }}>Total Cobrado</span>
                  <span style={{ color: "#111" }}>
                    {fmt(report.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>
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
};

export default ReportsPageRefined;