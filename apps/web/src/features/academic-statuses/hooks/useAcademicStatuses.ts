import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAcademicStatusApi,
  deleteAcademicStatusApi,
  getAcademicStatusByIdApi,
  getAcademicStatusesApi,
  updateAcademicStatusApi,
} from '../api/academic-statuses';
import type { CreateAcademicStatusInput, UpdateAcademicStatusInput } from '../types';

export const ACADEMIC_STATUSES_QUERY_KEY = ['academic-statuses'] as const;

export const useAcademicStatuses = () => {
  return useQuery({
    queryKey: ACADEMIC_STATUSES_QUERY_KEY,
    queryFn: getAcademicStatusesApi,
  });
};

export const useAcademicStatus = (id?: string) => {
  return useQuery({
    queryKey: [...ACADEMIC_STATUSES_QUERY_KEY, 'detail', id],
    queryFn: () => getAcademicStatusByIdApi(id as string),
    enabled: Boolean(id),
  });
};

export const useCreateAcademicStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAcademicStatusInput) => createAcademicStatusApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_STATUSES_QUERY_KEY });
    },
  });
};

export const useUpdateAcademicStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAcademicStatusInput }) =>
      updateAcademicStatusApi(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_STATUSES_QUERY_KEY });
    },
  });
};

export const useDeleteAcademicStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAcademicStatusApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACADEMIC_STATUSES_QUERY_KEY });
    },
  });
};
