import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createNationalityApi,
  deleteNationalityApi,
  getNationalityByIdApi,
  getNationalitiesApi,
  updateNationalityApi,
} from '../api/nationalities';
import type { CreateNationalityInput, UpdateNationalityInput } from '../types';

export const NATIONALITIES_QUERY_KEY = ['nationalities'] as const;

export const useNationalities = () => {
  return useQuery({
    queryKey: NATIONALITIES_QUERY_KEY,
    queryFn: getNationalitiesApi,
  });
};

export const useNationality = (id?: string) => {
  return useQuery({
    queryKey: [...NATIONALITIES_QUERY_KEY, 'detail', id],
    queryFn: () => getNationalityByIdApi(id as string),
    enabled: Boolean(id),
  });
};

export const useCreateNationality = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateNationalityInput) => createNationalityApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NATIONALITIES_QUERY_KEY });
    },
  });
};

export const useUpdateNationality = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNationalityInput }) =>
      updateNationalityApi(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NATIONALITIES_QUERY_KEY });
    },
  });
};

export const useDeleteNationality = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNationalityApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NATIONALITIES_QUERY_KEY });
    },
  });
};
