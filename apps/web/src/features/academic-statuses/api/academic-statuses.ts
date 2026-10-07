import { apiFetch } from '@/lib/api';
import { enrichAcademicStatus } from '../data/mockAcademicStatuses';
import type {
  AcademicStatus,
  ApiResponse,
  CreateAcademicStatusInput,
  UpdateAcademicStatusInput,
} from '../types';

export const getAcademicStatusesApi = async (): Promise<AcademicStatus[]> => {
  const response: ApiResponse<AcademicStatus[]> = await apiFetch('/academic-statuses');
  const rawData = Array.isArray(response.data) ? response.data : ((response as any).data?.data || []);
  return rawData.map(enrichAcademicStatus);
};

export const getAcademicStatusByIdApi = async (id: string): Promise<AcademicStatus> => {
  const response: ApiResponse<AcademicStatus> = await apiFetch(`/academic-statuses/${id}`);
  return enrichAcademicStatus(response.data);
};

export const createAcademicStatusApi = async (
  input: CreateAcademicStatusInput,
): Promise<AcademicStatus> => {
  const response: ApiResponse<AcademicStatus> = await apiFetch('/academic-statuses', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return enrichAcademicStatus(response.data);
};

export const updateAcademicStatusApi = async (
  id: string,
  input: UpdateAcademicStatusInput,
): Promise<AcademicStatus> => {
  const response: ApiResponse<AcademicStatus> = await apiFetch(`/academic-statuses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return enrichAcademicStatus(response.data);
};

export const deleteAcademicStatusApi = async (id: string): Promise<{ id: string }> => {
  const response: ApiResponse<{ id: string }> = await apiFetch(`/academic-statuses/${id}`, {
    method: 'DELETE',
  });
  return response.data;
};
