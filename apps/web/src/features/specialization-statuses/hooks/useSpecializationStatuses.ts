import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSpecializationApi,
  deleteSpecializationApi,
  getSpecializationByIdApi,
  getSpecializationsApi,
  updateSpecializationApi,
} from '../api/specialization-statuses';
import type { CreateSpecializationInput, UpdateSpecializationInput } from '../types';

export const SPECIALIZATIONS_QUERY_KEY = ['specializations'] as const;
export const SPECIALIZATION_STATUSES_QUERY_KEY = SPECIALIZATIONS_QUERY_KEY;

export const useSpecializations = () => {
  return useQuery({
    queryKey: SPECIALIZATIONS_QUERY_KEY,
    queryFn: getSpecializationsApi,
  });
};

export const useSpecialization = (id?: string) => {
  return useQuery({
    queryKey: [...SPECIALIZATIONS_QUERY_KEY, 'detail', id],
    queryFn: () => getSpecializationByIdApi(id as string),
    enabled: Boolean(id),
  });
};

export const useCreateSpecialization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSpecializationInput) => createSpecializationApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPECIALIZATIONS_QUERY_KEY });
    },
  });
};

export const useUpdateSpecialization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSpecializationInput }) =>
      updateSpecializationApi(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPECIALIZATIONS_QUERY_KEY });
    },
  });
};

export const useDeleteSpecialization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSpecializationApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPECIALIZATIONS_QUERY_KEY });
    },
  });
};

// Aliases for compatibility
export const useSpecializationStatuses = useSpecializations;
export const useSpecializationStatus = useSpecialization;
export const useCreateSpecializationStatus = useCreateSpecialization;
export const useUpdateSpecializationStatus = useUpdateSpecialization;
export const useDeleteSpecializationStatus = useDeleteSpecialization;
