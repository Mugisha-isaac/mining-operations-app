import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { checkInWorker, checkOutWorker, createWorker, fetchWorkers } from './workers.api';

export const WORKERS_QUERY_KEY = ['workers'];

export function useWorkersQuery() {
  return useQuery({ queryKey: WORKERS_QUERY_KEY, queryFn: fetchWorkers });
}

export function useCreateWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorker,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WORKERS_QUERY_KEY }),
  });
}

export function useCheckInWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkInWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useCheckOutWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkOutWorker,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
