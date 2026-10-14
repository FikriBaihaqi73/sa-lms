import { apiFetch } from '@/lib/api';
import type {
  Specialization,
  ApiResponse,
  CreateSpecializationInput,
  UpdateSpecializationInput,
} from '../types';

export const getSpecializationsApi = async (): Promise<Specialization[]> => {
  const response = (await apiFetch('/specializations')) as ApiResponse<Specialization[]>;
  const rawData = response.data;
  if (Array.isArray(rawData)) {
    return rawData;
  }
  if (rawData && typeof rawData === 'object' && 'data' in rawData && Array.isArray((rawData as { data: Specialization[] }).data)) {
    return (rawData as { data: Specialization[] }).data;
  }
  return [];
};

export const getSpecializationByIdApi = async (id: string): Promise<Specialization> => {
  const response = (await apiFetch(`/specializations/${id}`)) as ApiResponse<Specialization>;
  return response.data;
};

export const createSpecializationApi = async (
  input: CreateSpecializationInput,
): Promise<Specialization> => {
  const payload = {
    name: input.name.trim(),
    ...(input.description ? { description: input.description.trim() } : {}),
  };
  const response = (await apiFetch('/specializations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })) as ApiResponse<Specialization>;
  return response.data;
};

export const updateSpecializationApi = async (
  id: string,
  input: UpdateSpecializationInput,
): Promise<Specialization> => {
  const payload = {
    ...(input.name ? { name: input.name.trim() } : {}),
    ...(input.description !== undefined
      ? { description: input.description ? input.description.trim() : null }
      : {}),
  };
  const response = (await apiFetch(`/specializations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })) as ApiResponse<Specialization>;
  return response.data;
};

export const deleteSpecializationApi = async (id: string): Promise<{ id: string }> => {
  const response = (await apiFetch(`/specializations/${id}`, {
    method: 'DELETE',
  })) as ApiResponse<{ id: string }>;
  return response.data;
};

// Aliases for compatibility with existing imports
export const getSpecializationStatusesApi = getSpecializationsApi;
export const getSpecializationStatusByIdApi = getSpecializationByIdApi;
export const createSpecializationStatusApi = createSpecializationApi;
export const updateSpecializationStatusApi = updateSpecializationApi;
export const deleteSpecializationStatusApi = deleteSpecializationApi;
