import { apiFetch } from '@/lib/api';
import type {
  ApiResponse,
  CreateNationalityInput,
  Nationality,
  UpdateNationalityInput,
} from '../types';

export const getNationalitiesApi = async (): Promise<Nationality[]> => {
  const response: ApiResponse<Nationality[]> = await apiFetch('/nationalities');
  const items = Array.isArray(response.data) ? response.data : ((response as any).data?.data || []);
  return items;
};

export const getNationalityByIdApi = async (id: string): Promise<Nationality> => {
  const response: ApiResponse<Nationality> = await apiFetch(`/nationalities/${id}`);
  return response.data;
};

export const createNationalityApi = async (input: CreateNationalityInput): Promise<Nationality> => {
  const response: ApiResponse<Nationality> = await apiFetch('/nationalities', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.data;
};

export const updateNationalityApi = async (
  id: string,
  input: UpdateNationalityInput,
): Promise<Nationality> => {
  const response: ApiResponse<Nationality> = await apiFetch(`/nationalities/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return response.data;
};

export const deleteNationalityApi = async (id: string): Promise<{ id: string }> => {
  const response: ApiResponse<{ id: string }> = await apiFetch(`/nationalities/${id}`, {
    method: 'DELETE',
  });
  return response.data;
};
