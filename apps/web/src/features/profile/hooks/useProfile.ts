import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyProfileApi, updateMyProfileApi } from '../api/profile';
import type { UpdateProfileInput } from '../types';

export const PROFILE_QUERY_KEY = ['my-profile'];

export function useProfile() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getMyProfileApi,
  });

  return {
    profile: data || null,
    isPending: isLoading,
    isError,
    error,
    refresh: () => queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY }),
    refetch,
  };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: UpdateProfileInput) => updateMyProfileApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });

  return {
    updateProfile: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
