import { apiClient } from './api.config';
import type {
  ApiResponse,
} from './types';

// Tipos de promoción
export type PromotionType = 'bundle' | 'quantity' | 'mixed';

export interface PromotionItem {
  product: string;
  quantity: number;
  snapshotName: string;
  snapshotPrice: number;
}

export interface Promotion {
  id: string;
  name: string;
  description?: string;
  type: PromotionType;
  items: PromotionItem[];
  promoPrice: number;
  originalPrice: number;
  savings: number;
  discountPercentage: number;
  active: boolean;
  stock?: number;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePromotionDto {
  name: string;
  description?: string;
  type: PromotionType;
  items: PromotionItem[];
  promoPrice: number;
  originalPrice: number;
  active?: boolean;
  stock?: number;
  startsAt?: string;
  endsAt?: string;
}

export interface UpdatePromotionDto {
  name?: string;
  description?: string;
  type?: PromotionType;
  items?: PromotionItem[];
  promoPrice?: number;
  originalPrice?: number;
  active?: boolean;
  stock?: number;
  startsAt?: string;
  endsAt?: string;
}

export interface PaginatedPromotions {
  promotions: Promotion[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Obtener todas las promociones con paginación
 */
export const getAllPromotions = async (page: number = 1, limit: number = 10): Promise<PaginatedPromotions> => {
  const response = await apiClient.get<ApiResponse<PaginatedPromotions>>('/promotions', {
    params: { page, limit },
  });
  return response.data.data;
};

/**
 * Obtener un promoción por ID
 */
export const getPromotionById = async (id: string): Promise<Promotion> => {
  const response = await apiClient.get<ApiResponse<Promotion>>(`/promotions/${id}`);
  return response.data.data;
};

/**
 * Obtener promociones activas
 */
export const getActivePromotions = async (page: number = 1, limit: number = 10): Promise<PaginatedPromotions> => {
  const response = await apiClient.get<ApiResponse<PaginatedPromotions>>('/promotions/active', {
    params: { page, limit },
  });
  return response.data.data;
};

/**
 * Crear una nueva promoción
 */
export const createPromotion = async (promotion: CreatePromotionDto): Promise<Promotion> => {
  const response = await apiClient.post<ApiResponse<Promotion>>('/promotions', promotion);
  return response.data.data;
};

/**
 * Actualizar una promoción existente
 */
export const updatePromotion = async (
  id: string,
  promotion: UpdatePromotionDto
): Promise<Promotion> => {
  const response = await apiClient.put<ApiResponse<Promotion>>(`/promotions/${id}`, promotion);
  return response.data.data;
};

/**
 * Eliminar una promoción
 */
export const deletePromotion = async (id: string): Promise<void> => {
  await apiClient.delete(`/promotions/${id}`);
};

/**
 * Aumentar el stock de una promoción
 */
export const increaseStock = async (
  id: string,
  quantity: number
): Promise<Promotion> => {
  const response = await apiClient.post<ApiResponse<Promotion>>(
    `/promotions/${id}/increase-stock`,
    { quantity }
  );
  return response.data.data;
};

/**
 * Disminuir el stock de una promoción
 */
export const decreaseStock = async (
  id: string,
  quantity: number
): Promise<Promotion> => {
  const response = await apiClient.post<ApiResponse<Promotion>>(
    `/promotions/${id}/decrease-stock`,
    { quantity }
  );
  return response.data.data;
};

/**
 * Desactivar una promoción
 */
export const deactivatePromotion = async (id: string): Promise<Promotion> => {
  const response = await apiClient.post<ApiResponse<Promotion>>(
    `/promotions/${id}/deactivate`
  );
  return response.data.data;
};

/**
 * Obtener todas las promociones sin paginación
 */
export const getAllPromotionsNoPagination = async (): Promise<Promotion[]> => {
  const response = await apiClient.get<ApiResponse<Promotion[]>>('/promotions/all');
  return response.data.data;
};
