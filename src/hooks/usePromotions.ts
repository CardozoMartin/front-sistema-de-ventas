/**
 * Hooks personalizados para el módulo de Promociones usando TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import * as promotionsService from '../services/promotions.service';
import type { CreatePromotionDto, UpdatePromotionDto, Promotion } from '../services/promotions.service';

// ==================== QUERY KEYS ====================
export const promotionKeys = {
  all: ['promotions'] as const,
  lists: () => [...promotionKeys.all, 'list'] as const,
  list: (page?: number, limit?: number) => [...promotionKeys.lists(), { page, limit }] as const,
  active: (page?: number, limit?: number) => [...promotionKeys.all, 'active', { page, limit }] as const,
  details: () => [...promotionKeys.all, 'detail'] as const,
  detail: (id: string) => [...promotionKeys.details(), id] as const,
};

// ==================== QUERIES (GET) ====================

/**
 * Hook para obtener todas las promociones con paginación
 */
export const usePromotions = (options?: { page?: number; limit?: number }) => {
  const page = options?.page || 1;
  const limit = options?.limit || 10;

  return useQuery({
    queryKey: promotionKeys.list(page, limit),
    queryFn: () => promotionsService.getAllPromotions(page, limit),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obtener promociones activas
 */
export const useActivePromotions = (options?: { page?: number; limit?: number }) => {
  const page = options?.page || 1;
  const limit = options?.limit || 10;

  return useQuery({
    queryKey: promotionKeys.active(page, limit),
    queryFn: () => promotionsService.getActivePromotions(page, limit),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obtener una promoción específica por ID
 */
export const usePromotion = (id: string, enabled = true) => {
  return useQuery({
    queryKey: promotionKeys.detail(id),
    queryFn: () => promotionsService.getPromotionById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obtener todas las promociones sin paginación
 */
export const useAllPromotionsNoPagination = () => {
  return useQuery({
    queryKey: promotionKeys.all,
    queryFn: () => promotionsService.getAllPromotionsNoPagination(),
    staleTime: 5 * 60 * 1000,
  });
};

// ==================== MUTATIONS (POST, PUT, DELETE) ====================

/**
 * Hook para crear una nueva promoción
 */
export const useCreatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (promotion: CreatePromotionDto) => promotionsService.createPromotion(promotion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });
    },
  });
};

/**
 * Hook para actualizar una promoción existente
 */
export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromotionDto }) =>
      promotionsService.updatePromotion(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: promotionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });
    },
  });
};

/**
 * Hook para eliminar una promoción
 */
export const useDeletePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => promotionsService.deletePromotion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: promotionKeys.all });
    },
  });
};

/**
 * Hook para aumentar el stock de una promoción
 */
export const useIncreasePromotionStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      promotionsService.increaseStock(id, quantity),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: promotionKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook para disminuir el stock de una promoción
 */
export const useDecreasePromotionStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      promotionsService.decreaseStock(id, quantity),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: promotionKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook para desactivar una promoción
 */
export const useDeactivatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => promotionsService.deactivatePromotion(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: promotionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: promotionKeys.detail(id) });
    },
  });
};

/**
 * Hook para obtener promociones del localStorage (sin hacer peticiones API)
 * Ideal para búsqueda en punto de venta
 */
export const usePromotionsFromLocalStorage = () => {
  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const promotionsJson = localStorage.getItem('promotions');
    return promotionsJson ? JSON.parse(promotionsJson) : [];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const promotionsJson = localStorage.getItem('promotions');
      setPromotions(promotionsJson ? JSON.parse(promotionsJson) : []);
    };

    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return promotions;
};
