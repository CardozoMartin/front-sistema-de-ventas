/**
 * Servicio de API para el módulo de Caja Registradora
 * Maneja todas las operaciones relacionadas con cajas registradoras
 */

import { apiClient } from './api.config';
import type {
  ApiResponse,
  CashRegister,
  OpenCashRegisterDto,
  CloseCashRegisterDto,
} from './types';

/**
 * Obtener todas las cajas registradoras
 * GET /api/v1/cash-registers
 * Requiere autenticación (token)
 * @returns Lista de todas las cajas
 */
export const getAllCashRegisters = async (): Promise<CashRegister[]> => {
  const response = await apiClient.get<ApiResponse<CashRegister[]>>('/cash-registers');
  return response.data.data;
};

/**
 * Obtener una caja registradora por ID
 * GET /api/v1/cash-registers/:id
 * Requiere autenticación (token)
 * @param id - ID de la caja a buscar (string de MongoDB)
 * @returns Caja registradora encontrada
 */
export const getCashRegisterById = async (id: string | number): Promise<CashRegister> => {
  const response = await apiClient.get<ApiResponse<CashRegister>>(
    `/cash-registers/${id}`
  );
  return response.data.data;
};

/**
 * Obtener la caja registradora actualmente abierta
 * GET /api/v1/cash-registers/current
 * Requiere autenticación (token)
 * @returns Caja registradora abierta actualmente (si existe)
 */
export const getOpenCashRegister = async (): Promise<CashRegister | null> => {
  const response = await apiClient.get<ApiResponse<CashRegister | null>>(
    '/cash-registers/current'
  );
  return response.data.data;
};

/**
 * Obtener cajas registradoras por usuario
 * GET /api/v1/cash-registers/user/:userId
 * Requiere autenticación (token)
 * @param userId - ID del usuario
 * @returns Lista de cajas del usuario especificado
 */
export const getCashRegistersByUser = async (userId: number): Promise<CashRegister[]> => {
  const response = await apiClient.get<ApiResponse<CashRegister[]>>(
    `/cash-registers/user/${userId}`
  );
  return response.data.data;
};

/**
 * Abrir una nueva caja registradora
 * POST /api/v1/cash-registers/open
 * Requiere autenticación (token)
 * @param data - Datos para abrir la caja (usuario y monto inicial)
 * @returns Caja registradora abierta
 */
export const openCashRegister = async (
  data: OpenCashRegisterDto
): Promise<CashRegister> => {
  const response = await apiClient.post<ApiResponse<CashRegister>>(
    '/cash-registers/open',
    data
  );
  return response.data.data;
};

/**
 * Cerrar una caja registradora
 * POST /api/v1/cash-registers/:id/close
 * Requiere autenticación (token)
 * @param id - ID de la caja a cerrar (string de MongoDB)
 * @param data - Datos para cerrar la caja (monto de cierre)
 * @returns Caja registradora cerrada con totales
 */
export const closeCashRegister = async (
  id: string | number,
  data: CloseCashRegisterDto
): Promise<CashRegister> => {
  const response = await apiClient.post<ApiResponse<CashRegister>>(
    `/cash-registers/${id}/close`,
    data
  );
  return response.data.data;
};
