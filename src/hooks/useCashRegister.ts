/**
 * Hooks personalizados para el módulo de Caja Registradora usando TanStack Query
 * Proporciona hooks para todas las operaciones relacionadas con cajas registradoras
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as cashRegisterService from '../services/cashRegister.service';
import type { OpenCashRegisterDto, CloseCashRegisterDto } from '../services/types';

// ==================== QUERY KEYS ====================
// Claves para identificar las queries en el caché
export const cashRegisterKeys = {
  all: ['cash-registers'] as const,
  lists: () => [...cashRegisterKeys.all, 'list'] as const,
  list: () => [...cashRegisterKeys.lists()] as const,
  details: () => [...cashRegisterKeys.all, 'detail'] as const,
  detail: (id: number) => [...cashRegisterKeys.details(), id] as const,
  current: () => [...cashRegisterKeys.all, 'current'] as const,
  byUser: (userId: number) => [...cashRegisterKeys.all, 'user', userId] as const,
};

// ==================== QUERIES (GET) ====================

/**
 * Hook para obtener todas las cajas registradoras
 * @returns Query con la lista de todas las cajas
 * 
 * @example
 * const { data: cashRegisters, isLoading, error } = useCashRegisters();
 */
export const useCashRegisters = () => {
  return useQuery({
    queryKey: cashRegisterKeys.list(),
    queryFn: cashRegisterService.getAllCashRegisters,
    staleTime: 3 * 60 * 1000, // Los datos se consideran frescos por 3 minutos
  });
};

/**
 * Hook para obtener una caja registradora específica por ID
 * @param id - ID de la caja a obtener (string de MongoDB o number)
 * @param enabled - Si la query debe ejecutarse
 * @returns Query con la caja específica
 * 
 * @example
 * const { data: cashRegister, isLoading } = useCashRegister('698ff3bbfc1101497a1916ca');
 */
export const useCashRegister = (id: string | number, enabled = true) => {
  return useQuery({
    queryKey: cashRegisterKeys.detail(typeof id === 'string' ? parseInt(id.slice(-8), 16) : id),
    queryFn: () => cashRegisterService.getCashRegisterById(id),
    enabled: enabled,
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Hook para obtener la caja registradora actualmente abierta
 * @returns Query con la caja abierta actual (null si no hay ninguna)
 * 
 * @example
 * const { data: openCashRegister, isLoading } = useOpenCashRegister();
 * if (openCashRegister) {
 *   console.log('Caja abierta:', openCashRegister);
 * }
 */
export const useOpenCashRegister = () => {
  return useQuery({
    queryKey: cashRegisterKeys.current(),
    queryFn: cashRegisterService.getOpenCashRegister,
    staleTime: 1 * 60 * 1000, // Refrescar más frecuentemente (1 minuto)
  });
};

/**
 * Hook para obtener cajas de un usuario específico
 * @param userId - ID del usuario
 * @param enabled - Si la query debe ejecutarse
 * @returns Query con las cajas del usuario
 * 
 * @example
 * const { data: userCashRegisters } = useCashRegistersByUser(userId);
 */
export const useCashRegistersByUser = (userId: number, enabled = true) => {
  return useQuery({
    queryKey: cashRegisterKeys.byUser(userId),
    queryFn: () => cashRegisterService.getCashRegistersByUser(userId),
    enabled: enabled && userId > 0,
    staleTime: 3 * 60 * 1000,
  });
};

// ==================== MUTATIONS (POST) ====================

/**
 * Hook para abrir una nueva caja registradora
 * @returns Mutation para abrir caja con usuario y monto inicial
 * 
 * @example
 * const openCashRegister = useOpenCashRegister();
 * openCashRegister.mutate({
 *   userId: 1,
 *   openingAmount: 1000
 * }, {
 *   onSuccess: (data) => console.log('Caja abierta:', data),
 *   onError: (error) => console.error('Error al abrir caja:', error)
 * });
 */
export const useOpenCashRegisterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OpenCashRegisterDto) => cashRegisterService.openCashRegister(data),
    onSuccess: () => {
      // Invalidar todas las queries de cajas
      queryClient.invalidateQueries({ queryKey: cashRegisterKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cashRegisterKeys.current() });
    },
  });
};

/**
 * Hook para cerrar una caja registradora
 * @returns Mutation para cerrar caja con monto de cierre
 * 
 * @example
 * const closeCashRegister = useCloseCashRegister();
 * closeCashRegister.mutate({
 *   id: 1,
 *   data: { closingAmount: 5000 }
 * }, {
 *   onSuccess: (data) => {
 *     console.log('Caja cerrada');
 *     console.log('Total de ventas:', data.totalSales);
 *   }
 * });
 */
export const useCloseCashRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: CloseCashRegisterDto }) =>
      cashRegisterService.closeCashRegister(id, data),
    onSuccess: (_, variables) => {
      // Invalidar todas las queries de cajas
      queryClient.invalidateQueries({ queryKey: cashRegisterKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cashRegisterKeys.current() });
      queryClient.invalidateQueries({ queryKey: cashRegisterKeys.detail(parseInt(variables.id.toString())) });
    },
  });
};
