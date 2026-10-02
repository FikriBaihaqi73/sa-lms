import { apiFetch } from '@/lib/api';
import type {
  ApiResponse,
  CreateReligionInput,
  DeleteReligionResult,
  Religion,
  ReligionPageMeta,
  ReligionsResponse,
  UpdateReligionInput,
} from '../types';

export interface GetReligionsParams {
  page: number;
  limit: number;
  search?: string;
}

export const getReligionsApi = async ({
  page,
  limit,
  search,
}: GetReligionsParams): Promise<ReligionsResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const normalizedSearch = search?.trim();
  if (normalizedSearch) {
    params.set('search', normalizedSearch);
  }

  const response: ApiResponse<Religion[]> = await apiFetch(`/religions?${params.toString()}`);
  const responseMeta = response.meta;
  const meta: ReligionPageMeta = {
    page: responseMeta?.currentPage ?? page,
    limit: responseMeta?.perPage ?? limit,
    total: responseMeta?.totalData ?? response.data.length,
    totalPages: responseMeta?.totalPages ?? (response.data.length > 0 ? 1 : 0),
  };

  return { data: response.data ?? [], meta };
};

export const getReligionByIdApi = async (id: string): Promise<Religion> => {
  const response: ApiResponse<Religion> = await apiFetch(`/religions/${id}`);
  return response.data;
};

export const createReligionApi = async (input: CreateReligionInput): Promise<Religion> => {
  const response: ApiResponse<Religion> = await apiFetch('/religions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.data;
};

export const updateReligionApi = async (
  id: string,
  input: UpdateReligionInput,
): Promise<Religion> => {
  const response: ApiResponse<Religion> = await apiFetch(`/religions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return response.data;
};

export const deleteReligionApi = async (id: string): Promise<DeleteReligionResult> => {
  const response: ApiResponse<DeleteReligionResult> = await apiFetch(`/religions/${id}`, {
    method: 'DELETE',
  });
  return response.data;
};
