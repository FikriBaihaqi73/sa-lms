import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createReligionApi,
  deleteReligionApi,
  getReligionByIdApi,
  getReligionsApi,
  updateReligionApi,
  type GetReligionsParams,
} from '../api/religions';
import type { CreateReligionInput, UpdateReligionInput } from '../types';

export const RELIGIONS_QUERY_KEY = ['religions'] as const;

export const useReligions = (params: GetReligionsParams) => {
  return useQuery({
    queryKey: [...RELIGIONS_QUERY_KEY, params.page, params.limit, params.search ?? ''],
    queryFn: () => getReligionsApi(params),
    placeholderData: keepPreviousData,
  });
};

export const useReligion = (id?: string) => {
  return useQuery({
    queryKey: [...RELIGIONS_QUERY_KEY, 'detail', id],
    queryFn: () => getReligionByIdApi(id as string),
    enabled: Boolean(id),
  });
};

export const useCreateReligion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReligionInput) => createReligionApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RELIGIONS_QUERY_KEY });
    },
  });
};

export const useUpdateReligion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateReligionInput }) =>
      updateReligionApi(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RELIGIONS_QUERY_KEY });
    },
  });
};

export const useDeleteReligion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReligionApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RELIGIONS_QUERY_KEY });
    },
  });
};
