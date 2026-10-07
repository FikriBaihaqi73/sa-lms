import { apiFetch } from '@/lib/api';
import { enrichSpecializationStatus } from '../data/mockSpecializationStatuses';
import type {
  SpecializationStatus,
  ApiResponse,
  CreateSpecializationStatusInput,
  UpdateSpecializationStatusInput,
} from '../types';

export const getSpecializationStatusesApi = async (): Promise<SpecializationStatus[]> => {
  let response: ApiResponse<SpecializationStatus[]>;
  try {
    response = await apiFetch('/specializations');
  } catch {
    response = await apiFetch('/specialization-statuses');
  }
  const rawData = Array.isArray(response.data) ? response.data : ((response as any).data?.data || []);
  return rawData.map(enrichSpecializationStatus);
};

export const getSpecializationStatusByIdApi = async (id: string): Promise<SpecializationStatus> => {
  let response: ApiResponse<SpecializationStatus>;
  try {
    response = await apiFetch(`/specializations/${id}`);
  } catch {
    response = await apiFetch(`/specialization-statuses/${id}`);
  }
  return enrichSpecializationStatus(response.data);
};

export const createSpecializationStatusApi = async (
  input: CreateSpecializationStatusInput,
): Promise<SpecializationStatus> => {
  let response: ApiResponse<SpecializationStatus>;
  try {
    response = await apiFetch('/specializations', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  } catch {
    response = await apiFetch('/specialization-statuses', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }
  return enrichSpecializationStatus(response.data);
};

export const updateSpecializationStatusApi = async (
  id: string,
  input: UpdateSpecializationStatusInput,
): Promise<SpecializationStatus> => {
  let response: ApiResponse<SpecializationStatus>;
  try {
    response = await apiFetch(`/specializations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  } catch {
    response = await apiFetch(`/specialization-statuses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }
  return enrichSpecializationStatus(response.data);
};

export const deleteSpecializationStatusApi = async (id: string): Promise<{ id: string }> => {
  let response: ApiResponse<{ id: string }>;
  try {
    response = await apiFetch(`/specializations/${id}`, {
      method: 'DELETE',
    });
  } catch {
    response = await apiFetch(`/specialization-statuses/${id}`, {
      method: 'DELETE',
    });
  }
  return response.data;
};
