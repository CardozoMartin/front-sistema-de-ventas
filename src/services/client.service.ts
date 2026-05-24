/**
 * Servicio de API para el módulo de Clientes
 * Maneja todas las operaciones relacionadas con clientes y sus deudas
 */

import { apiClient } from './api.config';
import type {
  ApiResponse,
  Client,
  CreateClientDto,
  UpdateClientDto,
} from './types';

/**
 * Obtener todos los clientes activos
 * GET /api/v1/clients
 */
export const getAllClients = async (): Promise<Client[]> => {
  const response = await apiClient.get<ApiResponse<Client[]>>('/clients');
  return response.data.data;
};

/**
 * Obtener un cliente por ID
 * GET /api/v1/clients/:id
 */
export const getClientById = async (id: string): Promise<Client> => {
  const response = await apiClient.get<ApiResponse<Client>>(`/clients/${id}`);
  return response.data.data;
};

/**
 * Crear un nuevo cliente
 * POST /api/v1/clients
 */
export const createClient = async (data: CreateClientDto): Promise<Client> => {
  const response = await apiClient.post<ApiResponse<Client>>('/clients', data);
  return response.data.data;
};

/**
 * Actualizar datos de un cliente
 * PUT /api/v1/clients/:id
 */
export const updateClient = async (
  id: string,
  data: UpdateClientDto
): Promise<Client> => {
  const response = await apiClient.put<ApiResponse<Client>>(`/clients/${id}`, data);
  return response.data.data;
};

/**
 * Eliminar un cliente (Soft Delete)
 * DELETE /api/v1/clients/:id
 */
export const deleteClient = async (id: string): Promise<void> => {
  await apiClient.delete<ApiResponse<null>>(`/clients/${id}`);
};

/**
 * Registrar el pago de una deuda
 * POST /api/v1/clients/:id/pay
 */
export const payClientDebt = async (
  id: string,
  amount: number
): Promise<Client> => {
  const response = await apiClient.post<ApiResponse<Client>>(`/clients/${id}/pay`, { amount });
  return response.data.data;
};
