import { apiFetch } from '@/lib/api';
import type {
  ApiResponse,
  CreatePermissionInput,
  Permission,
  UpdatePermissionInput,
} from '../types';

/**
 * Fetch all permissions from the backend
 */
export const getPermissionsApi = async (): Promise<Permission[]> => {
  const response: ApiResponse<Permission[]> = await apiFetch('/permissions');
  return response.data || [];
};

/**
 * Get permission details by ID
 */
export const getPermissionByIdApi = async (id: string): Promise<Permission> => {
  const response: ApiResponse<Permission> = await apiFetch(`/permissions/${id}`);
  return response.data;
};

/**
 * Create a new permission
 */
export const createPermissionApi = async (
  input: CreatePermissionInput
): Promise<Permission> => {
  const response: ApiResponse<Permission> = await apiFetch('/permissions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.data;
};

/**
 * Update an existing permission by ID
 */
export const updatePermissionApi = async (
  id: string,
  input: UpdatePermissionInput
): Promise<Permission> => {
  const response: ApiResponse<Permission> = await apiFetch(`/permissions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return response.data;
};

/**
 * Delete a permission by ID
 */
export const deletePermissionApi = async (id: string): Promise<Permission> => {
  const response: ApiResponse<Permission> = await apiFetch(`/permissions/${id}`, {
    method: 'DELETE',
  });
  return response.data;
};
