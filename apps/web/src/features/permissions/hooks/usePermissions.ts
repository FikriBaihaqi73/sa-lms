import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPermissionApi,
  deletePermissionApi,
  getPermissionsApi,
  updatePermissionApi,
} from '../api/permissions';
import type { CreatePermissionInput, UpdatePermissionInput } from '../types';

export const PERMISSIONS_QUERY_KEY = ['permissions'];

/**
 * Query hook to fetch all permissions
 */
export const usePermissions = () => {
  return useQuery({
    queryKey: PERMISSIONS_QUERY_KEY,
    queryFn: getPermissionsApi,
  });
};

/**
 * Mutation hook to create a new permission
 */
export const useCreatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePermissionInput) => createPermissionApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_QUERY_KEY });
    },
  });
};

/**
 * Mutation hook to update an existing permission
 */
export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePermissionInput }) =>
      updatePermissionApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_QUERY_KEY });
    },
  });
};

/**
 * Mutation hook to delete a permission
 */
export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePermissionApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERMISSIONS_QUERY_KEY });
    },
  });
};
