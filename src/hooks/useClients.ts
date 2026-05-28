/**
 * Hooks personalizados para el módulo de Clientes usando TanStack Query
 * Proporciona hooks para operaciones CRUD y deudas de clientes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as clientService from '../services/client.service';
import type { CreateClientDto, UpdateClientDto } from '../services/types';

// ==================== QUERY KEYS ====================
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: () => [...clientKeys.lists()] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  statements: () => [...clientKeys.all, 'statement'] as const,
  statement: (id: string) => [...clientKeys.statements(), id] as const,
};

// ==================== QUERIES (GET) ====================

/**
 * Hook para obtener todos los clientes
 */
export const useClients = () => {
  return useQuery({
    queryKey: clientKeys.list(),
    queryFn: clientService.getAllClients,
    staleTime: 1 * 60 * 1000, // Datos frescos por 1 minuto
  });
};

/**
 * Hook para obtener un cliente específico por ID
 */
export const useClient = (id: string, enabled = true) => {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientService.getClientById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obtener el estado de cuenta de un cliente
 */
export const useClientStatement = (id: string, enabled = true) => {
  return useQuery({
    queryKey: clientKeys.statement(id),
    queryFn: () => clientService.getAccountStatement(id),
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000,
  });
};

// ==================== MUTATIONS (POST, PUT, DELETE) ====================

/**
 * Hook para crear un nuevo cliente
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (client: CreateClientDto) => clientService.createClient(client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
};

/**
 * Hook para actualizar un cliente existente
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientDto }) =>
      clientService.updateClient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook para eliminar un cliente (soft delete)
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
};

/**
 * Hook para registrar un pago de deuda
 */
export const usePayClientDebt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      clientService.payClientDebt(id, amount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: clientKeys.statement(variables.id) });
      // También invalidamos el dashboard ya que impacta en ingresos indirectamente
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
