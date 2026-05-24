/**
 * Hook para la página de Reportes.
 * Genera métricas detalladas a partir de las ventas con filtros por rango de fechas.
 */

import { useMemo, useState } from 'react';
import { useSales } from './useSales';
import type { Sale } from '../services/types';

// ==================== TYPES ====================

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ProductReport {
  productName: string;
  quantitySold: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number; // porcentaje
  unitType: string;
}

export interface PaymentMethodReport {
  method: string;
  label: string;
  count: number;
  total: number;
  percentage: number;
}

export interface DailySalesReport {
  date: string;
  salesCount: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ReportSummary {
  totalSales: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMargin: number;
  averageTicket: number;
  replenishmentCost: number; // cuánto necesitas para reponer lo vendido
  productReports: ProductReport[];
  paymentMethodReports: PaymentMethodReport[];
  dailySalesReports: DailySalesReport[];
  filteredSales: Sale[];
}

// ==================== HELPERS ====================

function getDateRangeForPreset(preset: 'today' | 'week' | 'month' | 'custom'): DateRange {
  const now = new Date();
  const start = new Date();
  const end = new Date();
  
  end.setHours(23, 59, 59, 999);
  
  switch (preset) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    default:
      start.setHours(0, 0, 0, 0);
  }
  
  return { start, end };
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ==================== HOOK ====================

export const useReports = () => {
  const { data: salesData, isLoading, error, refetch } = useSales();
  
  // Extraer las ventas ya sea si viene paginado o no
  const allSales: Sale[] = Array.isArray(salesData) 
    ? salesData 
    : (salesData as any)?.sales || [];
  
  const [preset, setPreset] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [customRange, setCustomRange] = useState<DateRange>(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  });

  const dateRange = useMemo(() => {
    if (preset === 'custom') return customRange;
    return getDateRangeForPreset(preset);
  }, [preset, customRange]);

  const report = useMemo((): ReportSummary | null => {
    if (isLoading) return null;

    // Filtrar ventas por rango de fechas y excluir canceladas
    const filtered = allSales.filter((sale: Sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= dateRange.start && saleDate <= dateRange.end && sale.status !== 'cancelado';
    });

    // === RESUMEN GENERAL ===
    const totalSales = filtered.length;
    
    // Revenue = solo efectivo + transferencia
    const realizedSales = filtered.filter(s => s.paymentMethod !== 'cuenta_corriente');
    const totalRevenue = realizedSales.reduce((sum, s) => sum + s.total, 0);
    
    // Costo y ganancia usando costPrice del SaleDetail
    let totalCost = 0;
    let totalProfit = 0;
    let replenishmentCost = 0; // TODAS las ventas incluyendo fiadas
    
    filtered.forEach(sale => {
      const saleCost = sale.details?.reduce((sum, d) => sum + d.costPrice * d.quantity, 0) || 0;
      replenishmentCost += saleCost;
      
      if (sale.paymentMethod !== 'cuenta_corriente') {
        totalCost += saleCost;
        totalProfit += sale.total - saleCost;
      }
    });
    
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const averageTicket = realizedSales.length > 0 ? totalRevenue / realizedSales.length : 0;
    
    // === REPORTE POR PRODUCTO ===
    const productMap = new Map<string, ProductReport>();
    
    filtered.forEach(sale => {
      // Excluir abonos de deuda del desglose de productos
      if (sale.notes === 'ABONO_DE_DEUDA') return;
      
      sale.details?.forEach(detail => {
        const key = detail.productName || 'Producto desconocido';
        const existing = productMap.get(key);
        const detailRevenue = detail.unitPrice * detail.quantity;
        const detailCost = detail.costPrice * detail.quantity;
        const detailProfit = detailRevenue - detailCost;
        
        if (existing) {
          existing.quantitySold += detail.quantity;
          existing.revenue += detailRevenue;
          existing.cost += detailCost;
          existing.profit += detailProfit;
          existing.margin = existing.revenue > 0 ? (existing.profit / existing.revenue) * 100 : 0;
        } else {
          productMap.set(key, {
            productName: key,
            quantitySold: detail.quantity,
            revenue: detailRevenue,
            cost: detailCost,
            profit: detailProfit,
            margin: detailRevenue > 0 ? (detailProfit / detailRevenue) * 100 : 0,
            unitType: detail.unitType || 'unidad',
          });
        }
      });
    });
    
    const productReports = Array.from(productMap.values())
      .sort((a, b) => b.profit - a.profit);
    
    // === DESGLOSE POR MÉTODO DE PAGO ===
    const methodLabels: Record<string, string> = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia',
      cuenta_corriente: 'Cuenta Corriente',
    };
    
    const methodMap = new Map<string, { count: number; total: number }>();
    filtered.forEach(sale => {
      const existing = methodMap.get(sale.paymentMethod);
      if (existing) {
        existing.count += 1;
        existing.total += sale.total;
      } else {
        methodMap.set(sale.paymentMethod, { count: 1, total: sale.total });
      }
    });
    
    const paymentMethodReports: PaymentMethodReport[] = Array.from(methodMap.entries()).map(([method, data]) => ({
      method,
      label: methodLabels[method] || method,
      count: data.count,
      total: data.total,
      percentage: totalSales > 0 ? (data.count / totalSales) * 100 : 0,
    }));
    
    // === VENTAS POR DÍA ===
    const dailyMap = new Map<string, DailySalesReport>();
    filtered.forEach(sale => {
      const dateStr = new Date(sale.createdAt).toLocaleDateString('es-AR');
      const saleCost = sale.details?.reduce((sum, d) => sum + d.costPrice * d.quantity, 0) || 0;
      const existing = dailyMap.get(dateStr);
      if (existing) {
        existing.salesCount += 1;
        existing.revenue += sale.total;
        existing.cost += saleCost;
        existing.profit += sale.total - saleCost;
      } else {
        dailyMap.set(dateStr, {
          date: dateStr,
          salesCount: 1,
          revenue: sale.total,
          cost: saleCost,
          profit: sale.total - saleCost,
        });
      }
    });
    
    const dailySalesReports = Array.from(dailyMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return {
      totalSales,
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin,
      averageTicket,
      replenishmentCost,
      productReports,
      paymentMethodReports,
      dailySalesReports,
      filteredSales: filtered,
    };
  }, [allSales, dateRange, isLoading]);

  // Exportar a CSV
  const exportToCSV = (type: 'products' | 'daily' | 'sales') => {
    if (!report) return;
    
    let csv = '';
    let filename = '';
    
    if (type === 'products') {
      csv = 'Producto,Cantidad Vendida,Ingreso,Costo,Ganancia,Margen %\n';
      report.productReports.forEach(p => {
        csv += `"${p.productName}",${p.quantitySold.toFixed(3)},${p.revenue.toFixed(2)},${p.cost.toFixed(2)},${p.profit.toFixed(2)},${p.margin.toFixed(1)}\n`;
      });
      filename = 'reporte_productos';
    } else if (type === 'daily') {
      csv = 'Fecha,Ventas,Ingresos,Costo,Ganancia\n';
      report.dailySalesReports.forEach(d => {
        csv += `"${d.date}",${d.salesCount},${d.revenue.toFixed(2)},${d.cost.toFixed(2)},${d.profit.toFixed(2)}\n`;
      });
      filename = 'reporte_diario';
    } else {
      csv = 'ID,Fecha,Total,Método de Pago,Estado,Vendedor\n';
      report.filteredSales.forEach(s => {
        csv += `"${s.id}","${new Date(s.createdAt).toLocaleString('es-AR')}",${s.total.toFixed(2)},"${s.paymentMethod}","${s.status}","${s.seller}"\n`;
      });
      filename = 'reporte_ventas';
    }
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${formatDateForInput(dateRange.start)}_${formatDateForInput(dateRange.end)}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    report,
    isLoading,
    error,
    refetch,
    preset,
    setPreset,
    dateRange,
    customRange,
    setCustomRange,
    exportToCSV,
    formatDateForInput,
  };
};
