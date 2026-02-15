/**
 * Hooks personalizados para el módulo de Auditoría usando TanStack Query
 * Proporciona hooks para todas las operaciones relacionadas con registros de auditoría
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as auditService from '../services/audit.service';
import type {
  CreateAuditDto,
  AuditEntitySearchParams,
} from '../services/types';

// ==================== QUERY KEYS ====================
// Claves para identificar las queries en el caché
export const auditKeys = {
  all: ['audits'] as const,
  lists: () => [...auditKeys.all, 'list'] as const,
  list: () => [...auditKeys.lists()] as const,
  details: () => [...auditKeys.all, 'detail'] as const,
  detail: (id: number) => [...auditKeys.details(), id] as const,
  byUser: (userId: number) => [...auditKeys.all, 'user', userId] as const,
  byEntity: (params: AuditEntitySearchParams) => 
    [...auditKeys.all, 'entity', params.entity, params.entityId] as const,
  byAction: (action: string) => [...auditKeys.all, 'action', action] as const,
};

// ==================== QUERIES (GET) ====================

/**
 * Hook para obtener todos los registros de auditoría
 * @returns Query con la lista de todos los registros de auditoría
 * 
 * @example
 * const { data: audits, isLoading, error } = useAudits();
 */
export const useAudits = () => {
  return useQuery({
    queryKey: auditKeys.list(),
    queryFn: auditService.getAllAudits,
    staleTime: 5 * 60 * 1000, // Los datos se consideran frescos por 5 minutos
  });
};

/**
 * Hook para obtener un registro de auditoría específico por ID
 * @param id - ID del registro de auditoría
 * @param enabled - Si la query debe ejecutarse
 * @returns Query con el registro de auditoría específico
 * 
 * @example
 * const { data: audit, isLoading } = useAudit(1);
 */
export const useAudit = (id: number, enabled = true) => {
  return useQuery({
    queryKey: auditKeys.detail(id),
    queryFn: () => auditService.getAuditById(id),
    enabled: enabled && id > 0, // Solo ejecutar si está habilitado y el ID es válido
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obtener registros de auditoría de un usuario específico
 * @param userId - ID del usuario
 * @param enabled - Si la query debe ejecutarse
 * @returns Query con los registros de auditoría del usuario
 * 
 * @example
 * const { data: userAudits, isLoading } = useAuditsByUser(userId);
 */
export const useAuditsByUser = (userId: number, enabled = true) => {
  return useQuery({
    queryKey: auditKeys.byUser(userId),
    queryFn: () => auditService.getAuditsByUser(userId),
    enabled: enabled && userId > 0,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obtener registros de auditoría por entidad
 * @param params - Parámetros de búsqueda (entidad y opcionalmente ID de entidad)
 * @param enabled - Si la query debe ejecutarse
 * @returns Query con los registros de auditoría de la entidad
 * 
 * @example
 * const { data: productAudits } = useAuditsByEntity({ entity: 'Product', entityId: 1 });
 */
export const useAuditsByEntity = (
  params: AuditEntitySearchParams,
  enabled = true
) => {
  return useQuery({
    queryKey: auditKeys.byEntity(params),
    queryFn: () => auditService.getAuditsByEntity(params),
    enabled: enabled && !!params.entity,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obtener registros de auditoría por acción
 * @param action - Tipo de acción a buscar (ej: 'CREATE', 'UPDATE', 'DELETE')
 * @param enabled - Si la query debe ejecutarse
 * @returns Query con los registros de auditoría de la acción
 * 
 * @example
 * const { data: createAudits } = useAuditsByAction('CREATE');
 */
export const useAuditsByAction = (action: string, enabled = true) => {
  return useQuery({
    queryKey: auditKeys.byAction(action),
    queryFn: () => auditService.getAuditsByAction({ action }),
    enabled: enabled && !!action,
    staleTime: 5 * 60 * 1000,
  });
};

// ==================== MUTATIONS (POST, DELETE) ====================

/**
 * Hook para crear un nuevo registro de auditoría
 * @returns Mutation para crear registro de auditoría
 * 
 * @example
 * const createAudit = useCreateAudit();
 * createAudit.mutate({
 *   userId: 1,
 *   action: 'CREATE',
 *   entity: 'Product',
 *   entityId: 5,
 *   details: 'Producto creado exitosamente'
 * });
 */
export const useCreateAudit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (audit: CreateAuditDto) => auditService.createAudit(audit),
    onSuccess: () => {
      // Invalidar el caché de auditorías
      queryClient.invalidateQueries({ queryKey: auditKeys.lists() });
    },
  });
};

/**
 * Hook para eliminar todos los registros de auditoría
 * ⚠️ ADVERTENCIA: Esta operación elimina TODOS los registros
 * @returns Mutation para eliminar todos los registros de auditoría
 * 
 * @example
 * const deleteAllAudits = useDeleteAllAudits();
 * deleteAllAudits.mutate(undefined, {
 *   onSuccess: () => console.log('Todas las auditorías eliminadas'),
 *   onError: (error) => console.error('Error:', error)
 * });
 */
export const useDeleteAllAudits = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => auditService.deleteAllAudits(),
    onSuccess: () => {
      // Limpiar todo el caché de auditorías
      queryClient.invalidateQueries({ queryKey: auditKeys.all });
    },
  });
};
