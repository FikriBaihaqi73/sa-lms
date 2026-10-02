import { apiFetch } from '@/lib/api';
import type {
  ApiResponse,
  CreateUserInput,
  DeleteUserResult,
  UpdateUserInput,
  User,
  UsersResponse,
} from '../types';

export interface GetUsersParams {
  page: number;
  limit: number;
  search?: string;
}

export const getUsersApi = async ({ page, limit, search }: GetUsersParams): Promise<UsersResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const normalizedSearch = search?.trim();
  if (normalizedSearch) {
    params.set('search', normalizedSearch);
  }

  const response: ApiResponse<UsersResponse> = await apiFetch(`/users?${params.toString()}`);
  return response.data;
};

export const getUserByIdApi = async (id: string): Promise<User> => {
  const response: ApiResponse<User> = await apiFetch(`/users/${id}`);
  return response.data;
};

export const createUserApi = async (input: CreateUserInput): Promise<User> => {
  const response: ApiResponse<User> = await apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.data;
};

export const updateUserApi = async (id: string, input: UpdateUserInput): Promise<User> => {
  const response: ApiResponse<User> = await apiFetch(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return response.data;
};

export const deleteUserApi = async (id: string): Promise<DeleteUserResult> => {
  const response: ApiResponse<DeleteUserResult> = await apiFetch(`/users/${id}`, {
    method: 'DELETE',
  });
  return response.data;
};
