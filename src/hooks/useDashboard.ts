/**
 * Hooks personalizados para el Dashboard
 * Proporciona métricas y estadísticas para el panel principal mediante estados derivados reactivos
 */

import { useMemo } from 'react';
import { useSales, saleKeys } from './useSales';
import { useOpenCashRegister, cashRegisterKeys } from './useCashRegister';
import { useProductsFromLocalStorage } from './useProducts';
import type { Sale, CashRegister } from '../services/types';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

// ==================== QUERY KEYS ====================
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: (period: string) => [...dashboardKeys.all, 'stats', period] as const,
};

// ==================== TYPES ====================

export interface DashboardStats {
  // Caja
  cashRegister: CashRegister | null;
  isCashRegisterOpen: boolean;
  openingAmount: number;
  currentBalance: number;
  
  // Ventas del período (según filtro: hoy, semana, mes)
  todaySales: number;
  todayRevenue: number;
  pendingRevenue: number;
  todayProfit: number;
  pendingProfit: number;
  
  // Costo de reposición: cuánto cuesta reponer lo vendido
  replenishmentCost: number;
  pendingReplenishmentCost: number;
  
  // Tendencias reales (comparación con período anterior)
  salesTrend: number | null;
  revenueTrend: number | null;
  profitTrend: number | null;
  
  // Totales históricos (para referencia si es necesario, pero los limitaremos al periodo)
  totalSales: number;
  totalRevenue: number;
  
  // Productos
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalStockValue: number;
  
  // Métricas adicionales
  averageSaleValue: number;
  profitMargin: number;
  salesByPaymentMethod: {
    efectivo: number;
    transferencia: number;
    cuentaCorriente: number;
  };
}

// ==================== HELPERS ====================

/**
 * Calcula la ganancia de una venta usando costPrice del SaleDetail (dato guardado en DB)
 * en vez de buscar en localStorage (que puede estar desactualizado).
 */
function calculateSaleProfit(sale: Sale): number {
  if (!sale.details || sale.details.length === 0) return 0;
  
  const totalCost = sale.details.reduce((sum, detail) => {
    return sum + (detail.costPrice * detail.quantity);
  }, 0);
  
  return sale.total - totalCost;
}

/**
 * Calcula el costo total de mercadería de una venta (para saber cuánto cuesta reponer)
 */
function calculateSaleCost(sale: Sale): number {
  if (!sale.details || sale.details.length === 0) return 0;
  
  return sale.details.reduce((sum, detail) => {
    return sum + (detail.costPrice * detail.quantity);
  }, 0);
}

/**
 * Calcula el porcentaje de cambio entre dos valores
 */
function calculateTrend(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

/**
 * Obtiene el rango de fechas del período anterior para comparación
 */
function getPreviousPeriodDates(period: 'today' | 'week' | 'month'): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date();
  const end = new Date();
  
  if (period === 'today') {
    // Ayer
    start.setDate(now.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end.setDate(now.getDate() - 1);
    end.setHours(23, 59, 59, 999);
  } else if (period === 'week') {
    // Semana anterior (7-14 días atrás)
    start.setDate(now.getDate() - 14);
    start.setHours(0, 0, 0, 0);
    end.setDate(now.getDate() - 7);
    end.setHours(0, 0, 0, 0);
  } else {
    // Mes anterior
    start.setMonth(now.getMonth() - 1, 1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(now.getMonth(), 0); // Último día del mes anterior
    end.setHours(23, 59, 59, 999);
  }
  
  return { start, end };
}

// ==================== HOOKS ====================

/**
 * Hook para obtener estadísticas completas del dashboard de forma reactiva en tiempo real (useMemo)
 */
export const useDashboardStats = (period: 'today' | 'week' | 'month' = 'today', scope: 'global' | 'session' = 'global') => {
  const queryClient = useQueryClient();
  
  const { data: salesData, isLoading: salesLoading, error: salesError, refetch: refetchSales } = useSales();
  const sales: Sale[] = Array.isArray(salesData) ? salesData : (salesData as any)?.sales || [];
  
  const { data: cashRegister, isLoading: cashRegisterLoading, error: cashRegisterError, refetch: refetchCashRegister } = useOpenCashRegister();
  const products = useProductsFromLocalStorage();

  const stats = useMemo((): DashboardStats | null => {
    if (salesLoading || cashRegisterLoading) return null;
    
    if (salesLoading || cashRegisterLoading) return null;
    const now = new Date();
    let filteredSalesList: Sale[] = [];

    if (period === 'today') {
      const todayStr = now.toDateString();
      filteredSalesList = sales.filter((sale: Sale) => {
        return new Date(sale.createdAt).toDateString() === todayStr;
      });
    } else {
      const cutoffDate = new Date();
      if (period === 'week') {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        cutoffDate.setDate(1);
      }
      cutoffDate.setHours(0, 0, 0, 0);

      filteredSalesList = sales.filter((sale: Sale) => {
        return new Date(sale.createdAt) >= cutoffDate;
      });
    }

    // === FILTRADO POR ALCANCE (SCOPE) ===
    if (scope === 'session') {
      if (cashRegister) {
        filteredSalesList = filteredSalesList.filter(sale => {
          const saleCashRegisterId = typeof sale.cashRegister === 'object' ? (sale.cashRegister as any)._id || (sale.cashRegister as any).id : sale.cashRegister;
          const currentCashRegisterId = (cashRegister as any)._id || cashRegister.id;
          
          
          return String(saleCashRegisterId) === String(currentCashRegisterId);
        });
      } else {
        filteredSalesList = [];
      }
    }
    
    // === VENTAS DEL PERÍODO ===
    
    // Solo ventas no canceladas para cálculos
    const activeSales = filteredSalesList.filter(sale => sale.status !== 'cancelado');
    const periodSalesCount = activeSales.length;
    
    // Ventas cobradas (efectivo + transferencia)
    const realizedSales = activeSales.filter(sale => sale.paymentMethod !== 'cuenta_corriente');
    const periodRevenue = realizedSales.reduce((sum, sale) => sum + sale.total, 0);
    
    // Ventas fiadas (cuenta corriente)
    const pendingSales = activeSales.filter(sale => sale.paymentMethod === 'cuenta_corriente');
    const pendingRevenue = pendingSales.reduce((sum, sale) => sum + sale.total, 0);
    
    // Ganancia real (solo de ventas cobradas)
    const periodProfit = realizedSales.reduce((sum, sale) => sum + calculateSaleProfit(sale), 0);
    
    // Ganancia pendiente (de ventas fiadas)
    const pendingProfit = pendingSales.reduce((sum, sale) => sum + calculateSaleProfit(sale), 0);
    
    // Costo de reposición real (de ventas cobradas)
    const replenishmentCost = realizedSales.reduce((sum, sale) => sum + calculateSaleCost(sale), 0);
    
    // Costo de reposición pendiente (de ventas fiadas)
    const pendingReplenishmentCost = pendingSales.reduce((sum, sale) => sum + calculateSaleCost(sale), 0);
    
    // === TENDENCIAS REALES (comparación con período anterior) ===
    const prevDates = getPreviousPeriodDates(period);
    const previousSales = sales.filter((sale: Sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= prevDates.start && saleDate <= prevDates.end && sale.status !== 'cancelado';
    });
    
    const prevRealizedSales = previousSales.filter(sale => sale.paymentMethod !== 'cuenta_corriente');
    const prevRevenue = prevRealizedSales.reduce((sum, sale) => sum + sale.total, 0);
    const prevProfit = prevRealizedSales.reduce((sum, sale) => sum + calculateSaleProfit(sale), 0);
    
    const salesTrend = calculateTrend(periodSalesCount, previousSales.length);
    const revenueTrend = calculateTrend(periodRevenue, prevRevenue);
    const profitTrend = calculateTrend(periodProfit, prevProfit);
    
    // === TOTALES HISTÓRICOS ===
    const totalSalesCount = sales.length;
    const totalRevenue = sales
      .filter(sale => sale.paymentMethod !== 'cuenta_corriente')
      .reduce((sum, sale) => sum + sale.total, 0);
    
    // === PRODUCTOS ===
    const lowStockThreshold = 10;
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= lowStockThreshold).length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;
    const totalStockValue = products.reduce((sum, product) => sum + (product.stock * (product.costPrice || 0)), 0);
    
    // Promedio de venta: solo divide entre ventas con ingreso real (excluye fiadas del numerador Y denominador)
    const averageSaleValue = realizedSales.length > 0 ? periodRevenue / realizedSales.length : 0;
    
    // Margen de ganancia porcentual
    const profitMargin = periodRevenue > 0 ? (periodProfit / periodRevenue) * 100 : 0;
    
    // Ventas por método de pago
    const salesByPaymentMethod = {
      efectivo: activeSales.filter(s => s.paymentMethod === 'efectivo').length,
      transferencia: activeSales.filter(s => s.paymentMethod === 'transferencia').length,
      cuentaCorriente: activeSales.filter(s => s.paymentMethod === 'cuenta_corriente').length,
    };
    
    // Balance actual de la caja (solo efectivo se suma a la caja física)
    const currentBalance = cashRegister 
      ? cashRegister.initialCash + cashRegister.totalCash
      : 0;
    
    // Para mantener total consistencia con la página de Reportes, 
    // SIEMPRE usamos los totales calculados a partir de los documentos de Sale.
    // La caja registradora (cashRegister) solo se usa para mostrar el balance real de la caja física.
    const displaySales = periodSalesCount;
    const displayRevenue = periodRevenue;
    const displayProfit = periodProfit;
    
    return {
      // Caja
      cashRegister: cashRegister || null,
      isCashRegisterOpen: !!cashRegister,
      openingAmount: cashRegister?.initialCash || 0,
      currentBalance,
      
      // Ventas del período
      todaySales: displaySales,
      todayRevenue: displayRevenue,
      pendingRevenue,
      todayProfit: displayProfit,
      pendingProfit,
      
      // Reposición
      replenishmentCost,
      pendingReplenishmentCost,
      
      // Tendencias reales
      salesTrend,
      revenueTrend,
      profitTrend,
      
      // Históricos
      totalSales: totalSalesCount,
      totalRevenue,
      
      // Productos
      totalProducts: products.length,
      lowStockProducts,
      outOfStockProducts,
      totalStockValue,
      
      // Métricas adicionales
      averageSaleValue,
      profitMargin,
      salesByPaymentMethod,
    };
  }, [sales, cashRegister, products, period, scope, salesLoading, cashRegisterLoading]);

  // Función para invalidar y forzar la sincronización real de la API
  const refetch = async () => {
    queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
    queryClient.invalidateQueries({ queryKey: cashRegisterKeys.all });
    await Promise.all([refetchSales(), refetchCashRegister()]);
  };

  return {
    data: stats,
    isLoading: salesLoading || cashRegisterLoading,
    error: salesError || cashRegisterError,
    refetch,
  };
};

/**
 * Hook para obtener los productos más vendidos filtrados por período de forma reactiva (useMemo)
 */
export const useTopSellingProducts = (limit: number = 10, period: 'today' | 'week' | 'month' = 'today', scope: 'global' | 'session' = 'global') => {
  const { data: salesData, isLoading: salesLoading } = useSales();
  const { data: cashRegister, isLoading: cashRegisterLoading } = useOpenCashRegister();
  const isLoading = salesLoading || cashRegisterLoading;
  const sales: Sale[] = Array.isArray(salesData) ? salesData : (salesData as any)?.sales || [];
  const products = useProductsFromLocalStorage();

  return useMemo(() => {
    if (isLoading || sales.length === 0) return { data: [], isLoading };

    const now = new Date();
    let filteredSales: Sale[] = [];

    if (period === 'today') {
      const todayStr = now.toDateString();
      filteredSales = sales.filter((sale: Sale) => {
        return new Date(sale.createdAt).toDateString() === todayStr;
      });
    } else {
      const cutoffDate = new Date();
      if (period === 'week') {
        cutoffDate.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        cutoffDate.setDate(1);
      }
      cutoffDate.setHours(0, 0, 0, 0);

      filteredSales = sales.filter((sale: Sale) => {
        return new Date(sale.createdAt) >= cutoffDate;
      });
    }

    if (scope === 'session') {
      if (cashRegister) {
        filteredSales = filteredSales.filter(sale => {
          const saleCashRegisterId = typeof sale.cashRegister === 'object' ? (sale.cashRegister as any)._id || (sale.cashRegister as any).id : sale.cashRegister;
          const currentCashRegisterId = (cashRegister as any)._id || cashRegister.id;
          return String(saleCashRegisterId) === String(currentCashRegisterId);
        });
      } else {
        filteredSales = [];
      }
    }

    const productSales = new Map<string, { name: string; quantity: number; revenue: number; profit: number }>();
    
    filteredSales.forEach((sale: Sale) => {
      // Excluir abonos de deuda de los productos más vendidos
      if (sale.notes === 'ABONO_DE_DEUDA') return;
      
      sale.details?.forEach((detail) => {
        const nameKey = detail.productName || 'Producto desconocido';
        const detailProfit = (detail.unitPrice - detail.costPrice) * detail.quantity;
        const existing = productSales.get(nameKey);
        if (existing) {
          existing.quantity += detail.quantity;
          existing.revenue += detail.unitPrice * detail.quantity;
          existing.profit += detailProfit;
        } else {
          productSales.set(nameKey, {
            name: nameKey,
            quantity: detail.quantity,
            revenue: detail.unitPrice * detail.quantity,
            profit: detailProfit,
          });
        }
      });
    });
    
    const sortedProducts = Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);

    return {
      data: sortedProducts,
      isLoading,
    };
  }, [sales, period, limit, scope, cashRegister, isLoading, products]);
};

// ==================== WEBSOCKET PARA DASHBOARD ====================

const getSocketUrl = () => {
  const url = import.meta.env.VITE_API_KEY || 'http://localhost:3000/api/v1';
  return url.replace(/\/api\/v1\/?$/, '');
};

export const useDashboardSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socket.on('cashRegisterStateChanged', () => {
      queryClient.invalidateQueries({ queryKey: cashRegisterKeys.all });
    });

    socket.on('saleStateChanged', () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);
};
