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
  LineChart, Line
} from 'recharts';

const ReportsPage = () => {
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
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-gray-600">Error al cargar los reportes</p>
          <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800">
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

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    <ArrowUpDown className={`w-3 h-3 inline ml-1 ${sortField === field ? 'text-neutral-800' : 'text-gray-400'}`} />
  );

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
        <div>
          <div className="inline-flex items-center justify-center p-2 bg-neutral-100 text-neutral-900 rounded-md mb-2">
            <PieChart size={20} strokeWidth={1.5} />
          </div>
          <h1 className="page-title">Reportes</h1>
          <p className="page-subtitle">Análisis financiero detallado de tu negocio</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => refetch()}
            className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-md transition-all hover:rotate-180 duration-500 cursor-pointer"
            title="Actualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {/* Filtro de período */}
          <div className="flex items-center gap-1 bg-neutral-100 rounded-md p-1 border border-neutral-200 overflow-x-auto">
            {(['today', 'week', 'month', 'custom'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap rounded-md cursor-pointer ${
                  preset === p
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-905'
                }`}
              >
                {p === 'today' ? 'Hoy' : p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Personalizado'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom date range */}
      {preset === 'custom' && (
        <div className="flex items-center gap-4 bg-white rounded-md border border-neutral-200 p-4">
          <Calendar size={18} className="text-neutral-400" strokeWidth={1.5} />
          <div className="flex items-center gap-3">
            <label className="text-xs text-neutral-500 font-medium">Desde:</label>
            <input
              type="date"
              value={formatDateForInput(customRange.start)}
              onChange={(e) => {
                const d = new Date(e.target.value);
                d.setHours(0, 0, 0, 0);
                setCustomRange(prev => ({ ...prev, start: d }));
              }}
              className="border border-neutral-200 rounded-md px-3 py-1.5 bg-white text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500/30 font-medium"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-neutral-500 font-medium">Hasta:</label>
            <input
              type="date"
              value={formatDateForInput(customRange.end)}
              onChange={(e) => {
                const d = new Date(e.target.value);
                d.setHours(23, 59, 59, 999);
                setCustomRange(prev => ({ ...prev, end: d }));
              }}
              className="border border-neutral-200 rounded-md px-3 py-1.5 bg-white text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500/30 font-medium"
            />
          </div>
        </div>
      )}

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Ventas */}
        <div className="bg-white rounded-md border border-neutral-200 p-5 transition-shadow hover:shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-neutral-100 text-neutral-900 rounded-md flex items-center justify-center shrink-0">
              <ShoppingCart size={18} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate">Ventas</span>
              <span className="text-xl font-semibold text-neutral-800 tracking-tight break-words leading-tight tabular-nums">{report.totalSales}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <span className="badge-neutral w-fit">
              Total período
            </span>
            <span className="text-[10px] font-medium text-neutral-400 mt-1">Unidades vendidas</span>
          </div>
        </div>

        {/* Ingresos */}
        <div className="bg-white rounded-md border border-neutral-200 p-5 transition-shadow hover:shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-accent-50 text-accent-700 rounded-md flex items-center justify-center shrink-0 border border-accent-100">
              <DollarSign size={18} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate">Ingresos</span>
              <span className="text-xl font-semibold text-neutral-800 tracking-tight break-words leading-tight tabular-nums">{formatCurrency(report.totalRevenue)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-[10px] font-medium text-neutral-400">Efectivo + Transferencia</span>
          </div>
        </div>

        {/* Ganancia */}
        <div className="bg-white rounded-md border border-neutral-200 p-5 transition-shadow hover:shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-accent-50 text-accent-700 rounded-md flex items-center justify-center shrink-0 border border-accent-100">
              <TrendingUp size={18} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate">Ganancia</span>
              <span className="text-xl font-semibold text-neutral-800 tracking-tight break-words leading-tight tabular-nums">{formatCurrency(report.totalProfit)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <span className="badge-success w-fit">
              Margen: {report.profitMargin.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Reposición */}
        <div className="bg-white rounded-md border border-neutral-200 p-5 transition-shadow hover:shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-neutral-100 text-neutral-800 rounded-md flex items-center justify-center shrink-0">
              <RotateCcw size={18} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate">Reposición</span>
              <span className="text-xl font-semibold text-neutral-800 tracking-tight break-words leading-tight tabular-nums">{formatCurrency(report.replenishmentCost)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-[10px] font-medium text-neutral-400">Para reponer vendido</span>
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="bg-white rounded-md border border-neutral-200 p-5 transition-shadow hover:shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-neutral-100 text-neutral-800 rounded-md flex items-center justify-center shrink-0">
              <Percent size={18} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider truncate">Ticket Promedio</span>
              <span className="text-xl font-semibold text-neutral-800 tracking-tight break-words leading-tight tabular-nums">{formatCurrency(report.averageTicket)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <span className="badge-neutral w-fit">
              Por venta
            </span>
            <span className="text-[10px] font-medium text-neutral-400 mt-1">Sin fiados incluidos</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-md shadow-sm border border-neutral-200 overflow-hidden flex flex-col">
        <div className="border-b border-neutral-200 px-6 pt-4 bg-neutral-50/50">
          <div className="flex items-center justify-between">
            <div className="flex gap-6 overflow-x-auto custom-scrollbar pb-2">
              {([
                { key: 'products', label: 'Productos', icon: BarChart3 },
                { key: 'daily', label: 'Por Día', icon: Calendar },
                { key: 'payments', label: 'Métodos de Pago', icon: DollarSign },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={activeTab === tab.key ? "tab-trigger-active" : "tab-trigger"}
                >
                  <tab.icon size={16} strokeWidth={1.5} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            
            {/* Export buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToCSV(activeTab === 'payments' ? 'sales' : activeTab === 'daily' ? 'daily' : 'products')}
                className="btn-secondary px-3 py-1.5 text-xs cursor-pointer"
              >
                <Download size={14} strokeWidth={1.5} />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* PRODUCTOS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {sortedProducts.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 text-neutral-300" strokeWidth={1.5} />
                  <p className="text-sm font-medium">No hay ventas en este período</p>
                </div>
              ) : (
                <>
                  <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200">
                    <h3 className="text-xs font-semibold text-neutral-700 mb-4">Top 10 Productos Más Vendidos (Ingresos)</h3>
                    <div style={{ width: '100%', height: '400px', minHeight: '0' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                           data={sortedProducts.slice(0, 10)}
                           margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                          <XAxis dataKey="productName" tick={{fontSize: 11, fill: '#71717A'}} tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val} />
                          <YAxis tickFormatter={(val) => `$${val}`} tick={{fontSize: 11, fill: '#71717A'}} />
                          <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                          <Bar dataKey="revenue" fill="#18181b" name="Ingresos" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="profit" fill="#5c6f61" name="Ganancia" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider border-b border-neutral-200">
                          <th className="pb-3 pr-4">Producto</th>
                          <th className="pb-3 pr-4 cursor-pointer select-none" onClick={() => toggleSort('quantitySold')}>
                            Cantidad <SortIcon field="quantitySold" />
                          </th>
                          <th className="pb-3 pr-4 cursor-pointer select-none" onClick={() => toggleSort('revenue')}>
                            Ingreso <SortIcon field="revenue" />
                          </th>
                          <th className="pb-3 pr-4">Costo</th>
                          <th className="pb-3 pr-4 cursor-pointer select-none" onClick={() => toggleSort('profit')}>
                            Ganancia <SortIcon field="profit" />
                          </th>
                          <th className="pb-3">Margen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {sortedProducts.map((product, index) => (
                          <tr key={product.productName} className="hover:bg-neutral-50 transition-colors">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-neutral-100 rounded-md flex items-center justify-center text-neutral-600 font-medium text-xs flex-shrink-0">
                                  {index + 1}
                                </div>
                                <span className="font-medium text-neutral-800 text-sm">{product.productName}</span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-sm text-neutral-600 tabular-nums">
                              {product.unitType === 'kilogramo'
                                ? `${product.quantitySold.toFixed(3)} kg`
                                : `${product.quantitySold} u`
                              }
                            </td>
                            <td className="py-3 pr-4 text-sm font-semibold text-neutral-800 tabular-nums">{formatCurrency(product.revenue)}</td>
                            <td className="py-3 pr-4 text-sm text-neutral-400 tabular-nums">{formatCurrency(product.cost)}</td>
                            <td className="py-3 pr-4">
                              <span className={`text-sm font-semibold tabular-nums ${product.profit >= 0 ? 'text-accent-700' : 'text-red-600'}`}>
                                {formatCurrency(product.profit)}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-neutral-200 rounded-full h-1">
                                  <div
                                    className={`h-1 rounded-full ${product.margin >= 30 ? 'bg-accent-500' : product.margin >= 15 ? 'bg-neutral-400' : 'bg-red-400'}`}
                                    style={{ width: `${Math.min(100, Math.max(0, product.margin))}%` }}
                                  />
                                </div>
                                <span className="text-xs text-neutral-500 w-12 text-right tabular-nums">{product.margin.toFixed(1)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-neutral-200 font-semibold text-sm">
                          <td className="pt-3 pr-4 text-neutral-800">TOTAL</td>
                          <td className="pt-3 pr-4 text-neutral-500">{sortedProducts.length} productos</td>
                          <td className="pt-3 pr-4 text-neutral-800 tabular-nums">{formatCurrency(report.totalRevenue)}</td>
                          <td className="pt-3 pr-4 text-neutral-400 tabular-nums">{formatCurrency(report.totalCost)}</td>
                          <td className="pt-3 pr-4 text-accent-700 tabular-nums">{formatCurrency(report.totalProfit)}</td>
                          <td className="pt-3 text-neutral-500 tabular-nums">{report.profitMargin.toFixed(1)}%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* POR DÍA TAB */}
          {activeTab === 'daily' && (
            <div className="space-y-6">
              {report.dailySalesReports.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 text-neutral-300" strokeWidth={1.5} />
                  <p className="text-sm font-medium">No hay ventas en este período</p>
                </div>
              ) : (
                <>
                  <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200">
                    <h3 className="text-xs font-semibold text-neutral-700 mb-4">Ingresos Diarios</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[...report.dailySalesReports].reverse()}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                          <XAxis dataKey="date" tick={{fontSize: 11, fill: '#71717A'}} />
                          <YAxis tickFormatter={(val) => `$${val}`} tick={{fontSize: 11, fill: '#71717A'}} />
                          <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                          <Line type="monotone" dataKey="revenue" stroke="#18181b" strokeWidth={2} name="Ingresos" dot={{r: 3}} activeDot={{r: 5}} />
                          <Line type="monotone" dataKey="profit" stroke="#5c6f61" strokeWidth={2} name="Ganancia" dot={{r: 3}} activeDot={{r: 5}} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider border-b border-neutral-200">
                          <th className="pb-3 pr-4">Fecha</th>
                          <th className="pb-3 pr-4">Ventas</th>
                          <th className="pb-3 pr-4">Ingresos</th>
                          <th className="pb-3 pr-4">Costo</th>
                          <th className="pb-3">Ganancia</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {report.dailySalesReports.map((day) => (
                          <tr key={day.date} className="hover:bg-neutral-50 transition-colors">
                            <td className="py-3 pr-4 text-sm font-medium text-neutral-800">{day.date}</td>
                            <td className="py-3 pr-4 text-sm text-neutral-600 tabular-nums">{day.salesCount}</td>
                            <td className="py-3 pr-4 text-sm font-semibold text-neutral-800 tabular-nums">{formatCurrency(day.revenue)}</td>
                            <td className="py-3 pr-4 text-sm text-neutral-400 tabular-nums">{formatCurrency(day.cost)}</td>
                            <td className="py-3">
                              <span className={`text-sm font-semibold tabular-nums ${day.profit >= 0 ? 'text-accent-700' : 'text-red-600'}`}>
                                {formatCurrency(day.profit)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-neutral-200 font-semibold text-sm">
                          <td className="pt-3 pr-4 text-neutral-800">TOTAL</td>
                          <td className="pt-3 pr-4 text-neutral-500 tabular-nums">{report.totalSales}</td>
                          <td className="pt-3 pr-4 text-neutral-800 tabular-nums">{formatCurrency(report.totalRevenue)}</td>
                          <td className="pt-3 pr-4 text-neutral-400 tabular-nums">{formatCurrency(report.totalCost)}</td>
                          <td className="pt-3 text-accent-700 tabular-nums">{formatCurrency(report.totalProfit)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* MÉTODOS DE PAGO TAB */}
          {activeTab === 'payments' && (
            <div>
              {report.paymentMethodReports.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 text-neutral-300" strokeWidth={1.5} />
                  <p className="text-sm font-medium">No hay ventas en este período</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Cards */}
                  <div className="space-y-4">
                    {report.paymentMethodReports.map((pm) => {
                      const colors: Record<string, { bg: string; bar: string; text: string; border: string }> = {
                        efectivo: { bg: 'bg-accent-50', bar: 'bg-accent-500', text: 'text-accent-850', border: 'border-accent-100' },
                        transferencia: { bg: 'bg-neutral-50', bar: 'bg-neutral-900', text: 'text-neutral-800', border: 'border-neutral-200' },
                        cuenta_corriente: { bg: 'bg-red-50/30', bar: 'bg-red-500', text: 'text-red-800', border: 'border-red-100' },
                      };
                      const color = colors[pm.method] || colors.efectivo;
                      
                      return (
                        <div key={pm.method} className={`p-4 rounded-md ${color.bg} border ${color.border}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className={`font-semibold text-sm ${color.text}`}>{pm.label}</h4>
                            <span className="text-xs text-neutral-400 font-medium tabular-nums">{pm.percentage.toFixed(1)}% del total</span>
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-xl font-semibold text-neutral-850 tabular-nums">{formatCurrency(pm.total)}</p>
                              <p className="text-xs text-neutral-400 mt-1 tabular-nums">{pm.count} {pm.count === 1 ? 'venta' : 'ventas'}</p>
                            </div>
                          </div>
                          <div className="mt-3 w-full bg-neutral-200/60 rounded-full h-1">
                            <div className={`h-1 rounded-full ${color.bar} transition-all`} style={{ width: `${pm.percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Resumen */}
                  <div className="bg-neutral-50 rounded-md p-6 border border-neutral-200">
                    <h4 className="font-semibold text-neutral-800 text-sm mb-4">Resumen de Cobros</h4>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600">Total en Efectivo</span>
                        <span className="font-semibold text-accent-700 tabular-nums">
                          {formatCurrency(report.paymentMethodReports.find(p => p.method === 'efectivo')?.total || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600">Total en Transferencias</span>
                        <span className="font-semibold text-neutral-850 tabular-nums">
                          {formatCurrency(report.paymentMethodReports.find(p => p.method === 'transferencia')?.total || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-600">Total Fiado</span>
                        <span className="font-semibold text-red-700 tabular-nums">
                          {formatCurrency(report.paymentMethodReports.find(p => p.method === 'cuenta_corriente')?.total || 0)}
                        </span>
                      </div>
                      <hr className="border-neutral-200" />
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-800 font-medium">Cobrado (efectivo + transf.)</span>
                        <span className="font-semibold text-neutral-900 text-base tabular-nums">
                          {formatCurrency(report.totalRevenue)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-800 font-medium">Pendiente (fiados)</span>
                        <span className="font-semibold text-red-700 text-base tabular-nums">
                          {formatCurrency(report.paymentMethodReports.find(p => p.method === 'cuenta_corriente')?.total || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
