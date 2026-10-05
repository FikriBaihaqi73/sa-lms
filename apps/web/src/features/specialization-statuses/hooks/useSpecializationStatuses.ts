import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSpecializationStatusApi,
  deleteSpecializationStatusApi,
  getSpecializationStatusByIdApi,
  getSpecializationStatusesApi,
  updateSpecializationStatusApi,
} from '../api/specialization-statuses';
import type { CreateSpecializationStatusInput, UpdateSpecializationStatusInput } from '../types';

export const SPECIALIZATION_STATUSES_QUERY_KEY = ['specialization-statuses'] as const;

export const useSpecializationStatuses = () => {
  return useQuery({
    queryKey: SPECIALIZATION_STATUSES_QUERY_KEY,
    queryFn: getSpecializationStatusesApi,
  });
};

export const useSpecializationStatus = (id?: string) => {
  return useQuery({
    queryKey: [...SPECIALIZATION_STATUSES_QUERY_KEY, 'detail', id],
    queryFn: () => getSpecializationStatusByIdApi(id as string),
    enabled: Boolean(id),
  });
};

export const useCreateSpecializationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSpecializationStatusInput) => createSpecializationStatusApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPECIALIZATION_STATUSES_QUERY_KEY });
    },
  });
};

export const useUpdateSpecializationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSpecializationStatusInput }) =>
      updateSpecializationStatusApi(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPECIALIZATION_STATUSES_QUERY_KEY });
    },
  });
};

export const useDeleteSpecializationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSpecializationStatusApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPECIALIZATION_STATUSES_QUERY_KEY });
    },
  });
};
