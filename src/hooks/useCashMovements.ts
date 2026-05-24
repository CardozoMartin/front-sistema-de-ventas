import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as cashMovementService from '../services/cashMovement.service';
import type { CreateCashMovementDto } from '../services/types';
import { cashRegisterKeys } from './useCashRegister';

export const cashMovementKeys = {
  all: ['cash-movements'] as const,
  byCashRegister: (cashRegisterId: string) =>
    [...cashMovementKeys.all, cashRegisterId] as const,
};

export const useCashMovements = (cashRegisterId: string | null, enabled = true) => {
  return useQuery({
    queryKey: cashMovementKeys.byCashRegister(cashRegisterId || ''),
    queryFn: () => cashMovementService.getCashMovementsByCashRegister(cashRegisterId!),
    enabled: enabled && !!cashRegisterId,
    staleTime: 1 * 60 * 1000,
  });
};

export const useCreateCashMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCashMovementDto) =>
      cashMovementService.createCashMovement(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: cashMovementKeys.byCashRegister(variables.cashRegisterId),
      });
      queryClient.invalidateQueries({ queryKey: cashRegisterKeys.current() });
      queryClient.invalidateQueries({ queryKey: cashRegisterKeys.lists() });
    },
  });
};
