/**
 * Servicio de API para el módulo de Auditoría
 * Maneja todas las operaciones relacionadas con registros de auditoría
 */

import { apiClient } from './api.config';
import type {
  ApiResponse,
  Audit,
  CreateAuditDto,
  AuditEntitySearchParams,
  AuditActionSearchParams,
} from './types';

/**
 * Obtener todos los registros de auditoría
 * GET /api/v1/audits
 * @returns Lista de todos los registros de auditoría
 */
export const getAllAudits = async (): Promise<Audit[]> => {
  const response = await apiClient.get<ApiResponse<Audit[]>>('/audits');
  return response.data.data;
};

/**
 * Obtener un registro de auditoría por ID
 * GET /api/v1/audits/:id
 * @param id - ID del registro de auditoría
 * @returns Registro de auditoría encontrado
 */
export const getAuditById = async (id: number): Promise<Audit> => {
  const response = await apiClient.get<ApiResponse<Audit>>(`/audits/${id}`);
  return response.data.data;
};

/**
 * Obtener registros de auditoría por usuario
 * GET /api/v1/audits/user/:userId
 * @param userId - ID del usuario
 * @returns Lista de auditorías del usuario especificado
 */
export const getAuditsByUser = async (userId: number): Promise<Audit[]> => {
  const response = await apiClient.get<ApiResponse<Audit[]>>(`/audits/user/${userId}`);
  return response.data.data;
};

/**
 * Obtener registros de auditoría por entidad
 * GET /api/v1/audits/entity/search?entity=...&entityId=...
 * @param params - Parámetros de búsqueda (entidad y opcionalmente ID de entidad)
 * @returns Lista de auditorías de la entidad especificada
 */
export const getAuditsByEntity = async (
  params: AuditEntitySearchParams
): Promise<Audit[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append('entity', params.entity);
  if (params.entityId) {
    queryParams.append('entityId', params.entityId.toString());
  }
  
  const response = await apiClient.get<ApiResponse<Audit[]>>(
    `/audits/entity/search?${queryParams.toString()}`
  );
  return response.data.data;
};

/**
 * Obtener registros de auditoría por acción
 * GET /api/v1/audits/action/search?action=...
 * @param params - Parámetros de búsqueda (acción)
 * @returns Lista de auditorías de la acción especificada
 */
export const getAuditsByAction = async (
  params: AuditActionSearchParams
): Promise<Audit[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append('action', params.action);
  
  const response = await apiClient.get<ApiResponse<Audit[]>>(
    `/audits/action/search?${queryParams.toString()}`
  );
  return response.data.data;
};

/**
 * Crear un nuevo registro de auditoría
 * POST /api/v1/audits
 * @param audit - Datos del registro de auditoría a crear
 * @returns Registro de auditoría creado
 */
export const createAudit = async (audit: CreateAuditDto): Promise<Audit> => {
  const response = await apiClient.post<ApiResponse<Audit>>('/audits', audit);
  return response.data.data;
};

/**
 * Eliminar todos los registros de auditoría
 * DELETE /api/v1/audits
 * ⚠️ ADVERTENCIA: Esta operación elimina TODOS los registros
 * @returns Confirmación de eliminación
 */
export const deleteAllAudits = async (): Promise<void> => {
  await apiClient.delete('/audits');
};
