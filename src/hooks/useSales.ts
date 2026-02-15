/**
 * Hooks personalizados para el módulo de Ventas usando TanStack Query
 * Proporciona hooks para todas las operaciones relacionadas con ventas
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as salesService from '../services/sales.service';
import type { CreateSaleDto, UpdateSaleDto } from '../services/types';

// ==================== QUERY KEYS ====================
// Claves para identificar las queries en el caché
export const saleKeys = {
  all: ['sales'] as const,
  lists: () => [...saleKeys.all, 'list'] as const,
  list: () => [...saleKeys.lists()] as const,
  details: () => [...saleKeys.all, 'detail'] as const,
  detail: (id: string) => [...saleKeys.details(), id] as const,
  bySeller: (sellerId: string) => [...saleKeys.all, 'seller', sellerId] as const,
  byCashRegister: (cashRegisterId: string) => [...saleKeys.all, 'cashRegister', cashRegisterId] as const,
};

// ==================== QUERIES (GET) ====================

/**
 * Hook para obtener todas las ventas
 * @returns Query con la lista de todas las ventas
 * 
 * @example
 * const { data: sales, isLoading, error } = useSales();
 */
export const useSales = () => {
  return useQuery({
    queryKey: saleKeys.list(),
    queryFn: salesService.getAllSales,
    staleTime: 2 * 60 * 1000, // Los datos se consideran frescos por 2 minutos
  });
};

/**
 * Hook para obtener una venta específica por ID
 * @param id - ID de la venta a obtener
 * @param enabled - Si la query debe ejecutarse
 * @returns Query con la venta específica y sus detalles
 * 
 * @example
 * const { data: sale, isLoading } = useSale('60d5ec49f1b2c8b1f8e4e1a0');
 */
export const useSale = (id: string, enabled = true) => {
  return useQuery({
    queryKey: saleKeys.detail(id),
    queryFn: () => salesService.getSaleById(id),
    enabled: enabled && id.length > 0, // Solo ejecutar si está habilitado y el ID es válido
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook para obtener ventas de un vendedor específico
 * @param sellerId - ID del vendedor
 * @param enabled - Si la query debe ejecutarse
 * @returns Query con las ventas del vendedor
 * 
 * @example
 * const { data: sellerSales, isLoading } = useSalesBySeller(userId);
 */
export const useSalesBySeller = (sellerId: string, enabled = true) => {
  return useQuery({
    queryKey: saleKeys.bySeller(sellerId),
    queryFn: () => salesService.getSalesBySeller(sellerId),
    enabled: enabled && sellerId.length > 0,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Hook para obtener ventas de una caja registradora específica
 * @param cashRegisterId - ID de la caja registradora
 * @param enabled - Si la query debe ejecutarse
 * @returns Query con las ventas de la caja registradora
 * 
 * @example
 * const { data: cashRegisterSales, isLoading } = useSalesByCashRegister(cashRegisterId);
 */
export const useSalesByCashRegister = (cashRegisterId: string | null, enabled = true) => {
  return useQuery({
    queryKey: saleKeys.byCashRegister(cashRegisterId || ''),
    queryFn: () => salesService.getSalesByCashRegister(cashRegisterId || ''),
    enabled: enabled && (cashRegisterId?.length || 0) > 0,
    staleTime: 1 * 60 * 1000, // Los datos se consideran frescos por 1 minuto (transactions are more dynamic)
  });
};

// ==================== MUTATIONS (POST, PUT, DELETE) ====================

/**
 * Hook para crear una nueva venta
 * @returns Mutation para crear venta con detalles de productos
 * 
 * @example
 * const createSale = useCreateSale();
 * createSale.mutate({
 *   sellerId: 1,
 *   cashRegisterId: 1,
 *   paymentMethod: 'efectivo',
 *   saleDetails: [{ productId: 1, quantity: 2, unitPrice: 100 }]
 * }, {
 *   onSuccess: (sale) => console.log('Venta creada:', sale),
 *   onError: (error) => console.error('Error:', error)
 * });
 */
export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sale: CreateSaleDto) => salesService.createSale(sale),
    onSuccess: () => {
      // Invalidar el caché de ventas y productos (por el cambio de stock)
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
    },
  });
};

/**
 * Hook para actualizar una venta existente
 * @returns Mutation para actualizar venta
 * 
 * @example
 * const updateSale = useUpdateSale();
 * updateSale.mutate({ id: '60d5ec49f1b2c8b1f8e4e1a0', data: { status: 'pagado' } });
 */
export const useUpdateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSaleDto }) =>
      salesService.updateSale(id, data),
    onSuccess: (_, variables) => {
      // Invalidar tanto la lista como el detalle de la venta
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook para cancelar una venta
 * @returns Mutation para cancelar venta (restaura stock)
 * 
 * @example
 * const cancelSale = useCancelSale();
 * cancelSale.mutate(saleId, {
 *   onSuccess: () => console.log('Venta cancelada')
 * });
 */
export const useCancelSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salesService.cancelSale(id),
    onSuccess: (_, id) => {
      // Invalidar ventas, productos (por restauración de stock) y cajas
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
    },
  });
};

/**
 * Hook para completar una venta pendiente
 * @returns Mutation para completar venta
 * 
 * @example
 * const completeSale = useCompleteSale();
 * completeSale.mutate(saleId);
 */
export const useCompleteSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => salesService.completeSale(id),
    onSuccess: (_, id) => {
      // Invalidar ventas y cajas
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: saleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['cash-registers'] });
    },
  });
};
