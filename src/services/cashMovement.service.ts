import { apiClient } from './api.config';
import type { ApiResponse, CashMovement, CreateCashMovementDto } from './types';

export const createCashMovement = async (
  data: CreateCashMovementDto
): Promise<CashMovement> => {
  const response = await apiClient.post<ApiResponse<CashMovement>>(
    '/cash-movements',
    data
  );
  return response.data.data;
};

export const getCashMovementsByCashRegister = async (
  cashRegisterId: string
): Promise<CashMovement[]> => {
  const response = await apiClient.get<ApiResponse<CashMovement[]>>(
    `/cash-movements/${cashRegisterId}`
  );
  return response.data.data;
};
