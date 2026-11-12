import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getEmploymentStatuses,
  createEmploymentStatus,
  updateEmploymentStatus,
  deleteEmploymentStatus,
} from '../api/employment-statuses';
import type { EmploymentStatusFormValues } from '../schemas/employmentStatusSchema';

export const EMPLOYMENT_STATUSES_QUERY_KEY = ['employment-statuses'] as const;

export function useEmploymentStatuses() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: EMPLOYMENT_STATUSES_QUERY_KEY,
    queryFn: getEmploymentStatuses,
  });

  return {
    data: data || [],
    isPending: isLoading,
    isError,
    error,
    refresh: () => queryClient.invalidateQueries({ queryKey: EMPLOYMENT_STATUSES_QUERY_KEY }),
    refetch,
  };
}

export function useCreateEmploymentStatus() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: EmploymentStatusFormValues) => createEmploymentStatus(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: EMPLOYMENT_STATUSES_QUERY_KEY });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}

export function useUpdateEmploymentStatus() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: EmploymentStatusFormValues }) =>
      updateEmploymentStatus({ id, input }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: EMPLOYMENT_STATUSES_QUERY_KEY });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}

export function useDeleteEmploymentStatus() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => deleteEmploymentStatus(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: EMPLOYMENT_STATUSES_QUERY_KEY });
    },
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
