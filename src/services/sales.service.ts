/**
 * Servicio de API para el módulo de Ventas
 * Maneja todas las operaciones relacionadas con ventas
 */

import { apiClient } from './api.config';
import type {
  ApiResponse,
  Sale,
  CreateSaleDto,
  UpdateSaleDto,
} from './types';

export interface PaginatedSalesResponse {
  sales: Sale[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}

/**
 * Obtener todas las ventas (con paginación opcional)
 * GET /api/v1/sales
 */
export const getAllSales = async (page?: number, limit?: number): Promise<Sale[] | PaginatedSalesResponse> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  
  const query = params.toString() ? `?${params.toString()}` : '';
  
  const response = await apiClient.get(`/sales${query}`);
  
  // Si la respuesta incluye paginación en el objeto original
  if (response.data?.pagination) {
    return {
      sales: response.data.data,
      ...response.data.pagination
    };
  }
  
  // Fallback a solo la lista
  return response.data.data;
};

/**
 * Obtener una venta por ID
 * GET /api/v1/sales/:id
 * @param id - ID de la venta a buscar
 * @returns Venta encontrada con sus detalles
 */
export const getSaleById = async (id: string): Promise<Sale> => {
  const response = await apiClient.get<ApiResponse<Sale>>(`/sales/${id}`);
  return response.data.data;
};

/**
 * Obtener ventas por vendedor
 * GET /api/v1/sales/seller/:sellerId
 * @param sellerId - ID del vendedor
 * @returns Lista de ventas del vendedor especificado
 */
export const getSalesBySeller = async (sellerId: string): Promise<Sale[]> => {
  const response = await apiClient.get<ApiResponse<Sale[]>>(
    `/sales/seller/${sellerId}`
  );
  return response.data.data;
};

/**
 * Obtener ventas por caja registradora
 * GET /api/v1/sales/cash-register/:cashRegisterId
 * @param cashRegisterId - ID de la caja registradora
 * @returns Lista de ventas de la caja registradora especificada
 */
export const getSalesByCashRegister = async (cashRegisterId: string): Promise<Sale[]> => {
  const response = await apiClient.get<ApiResponse<Sale[]>>(
    `/sales/cash-register/${cashRegisterId}`
  );
  return response.data.data;
};

/**
 * Obtener ventas por cliente (usado para cuenta corriente)
 * GET /api/v1/sales/client/:clientId
 * @param clientId - ID del cliente
 * @returns Lista de ventas asociadas al cliente
 */
export const getSalesByClient = async (clientId: string): Promise<Sale[]> => {
  const response = await apiClient.get<ApiResponse<Sale[]>>(
    `/sales/client/${clientId}`
  );
  return response.data.data;
};

/**
 * Crear una nueva venta
 * POST /api/v1/sales
 * Requiere autenticación (token)
 * @param sale - Datos de la venta a crear (incluye detalles de productos)
 * @returns Venta creada
 */
export const createSale = async (sale: CreateSaleDto): Promise<Sale> => {
  const response = await apiClient.post<ApiResponse<Sale>>('/sales', sale);
  return response.data.data;
};

/**
 * Actualizar una venta existente
 * PUT /api/v1/sales/:id
 * Requiere autenticación (token)
 * @param id - ID de la venta a actualizar
 * @param sale - Datos de la venta a actualizar
 * @returns Venta actualizada
 */
export const updateSale = async (id: string, sale: UpdateSaleDto): Promise<Sale> => {
  const response = await apiClient.put<ApiResponse<Sale>>(`/sales/${id}`, sale);
  return response.data.data;
};

/**
 * Cancelar una venta
 * POST /api/v1/sales/:id/cancel
 * Requiere autenticación (token)
 * @param id - ID de la venta a cancelar
 * @returns Venta cancelada
 */
export const cancelSale = async (id: string): Promise<Sale> => {
  const response = await apiClient.post<ApiResponse<Sale>>(`/sales/${id}/cancel`);
  return response.data.data;
};

/**
 * Completar una venta pendiente
 * POST /api/v1/sales/:id/complete
 * Requiere autenticación (token)
 * @param id - ID de la venta a completar
 * @returns Venta completada
 */
export const completeSale = async (id: string): Promise<Sale> => {
  const response = await apiClient.post<ApiResponse<Sale>>(`/sales/${id}/complete`);
  return response.data.data;
};
