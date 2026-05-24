
import {
  UserCheck,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Percent,
  Package,
  AlertCircle,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { formatCurrency } from "../../utils/formatCurrency";
import type { DashboardStats } from "../../hooks/useDashboard";

interface DashboardMetricsGridProps {
  stats: DashboardStats;
  role: "admin" | "cashier";
  openRegistersCount?: number;
  onOpenRegistersClick?: () => void;
  periodLabel: string;
}

export const DashboardMetricsGrid = ({
  stats,
  role,
  openRegistersCount = 0,
  onOpenRegistersClick,
  periodLabel,
}: DashboardMetricsGridProps) => {
  const formatTrend = (trend: number | null): string | undefined => {
    if (trend === null) return undefined;
    const sign = trend >= 0 ? "+" : "";
    return `${sign}${trend.toFixed(1)}%`;
  };

  const getTrendDirection = (trend: number | null): "up" | "down" | "neutral" | undefined => {
    if (trend === null) return undefined;
    if (trend > 0) return "up";
    if (trend < 0) return "down";
    return "neutral";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Primer fila de métricas principales de ventas/operación */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {role === "admin" && (
          <MetricCard
            title="Personal trabajando"
            value={openRegistersCount}
            icon={UserCheck}
            subtitle="Cajas abiertas"
            onClick={onOpenRegistersClick}
          />
        )}
        <MetricCard
          title={`Ventas — ${periodLabel}`}
          value={stats.todaySales}
          icon={ShoppingCart}
          trend={getTrendDirection(stats.salesTrend)}
          trendValue={formatTrend(stats.salesTrend)}
        />
        <MetricCard
          title={`Ingresos — ${periodLabel}`}
          value={formatCurrency(stats.todayRevenue)}
          icon={DollarSign}
          trend={getTrendDirection(stats.revenueTrend)}
          trendValue={formatTrend(stats.revenueTrend)}
          subtitle={
            <div className="flex flex-col gap-1 mt-1">
              <span>Efectivo + transferencia</span>
              {stats.pendingRevenue > 0 && (
                <span className="text-orange-500 font-medium">Por cobrar (fiados): {formatCurrency(stats.pendingRevenue)}</span>
              )}
            </div>
          }
        />
        <MetricCard
          title={`Ganancias — ${periodLabel}`}
          value={formatCurrency(stats.todayProfit)}
          icon={TrendingUp}
          trend={getTrendDirection(stats.profitTrend)}
          trendValue={formatTrend(stats.profitTrend)}
          subtitle={
            <div className="flex flex-col gap-1 mt-1">
              <span>Margen: {stats.profitMargin.toFixed(1)}%</span>
              {stats.pendingProfit > 0 && (
                <span className="text-orange-500 font-medium">Ganancia en fiados: {formatCurrency(stats.pendingProfit)}</span>
              )}
            </div>
          }
        />
        <MetricCard
          title="Costo reposición"
          value={formatCurrency(stats.replenishmentCost)}
          icon={RotateCcw}
          subtitle={
            <div className="flex flex-col gap-1 mt-1">
              <span>Para reponer mercadería vendida</span>
              {stats.pendingReplenishmentCost > 0 && (
                <span className="text-orange-500 font-medium">Costo retenido (fiados): {formatCurrency(stats.pendingReplenishmentCost)}</span>
              )}
            </div>
          }
        />
        <MetricCard
          title="Valor promedio"
          value={formatCurrency(stats.averageSaleValue)}
          icon={Percent}
          subtitle="Por venta cobrada (sin fiados)"
        />
      </div>

      {/* Segunda fila de métricas de inventario */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Productos registrados"
          value={stats.totalProducts}
          icon={Package}
        />
        <MetricCard
          title="Stock bajo"
          value={stats.lowStockProducts}
          icon={AlertCircle}
          subtitle={`${stats.outOfStockProducts} sin stock`}
        />
        <MetricCard
          title="Valor total stock"
          value={formatCurrency(stats.totalStockValue)}
          icon={Package}
          subtitle="Inversión en inventario"
        />
      </div>
    </div>
  );
};
