import { apiFetch } from '@/lib/api';
import type {
  ApiResponse,
  CreateSettingInput,
  Setting,
  UpdateSettingInput,
} from '../types';

export const getSettingsApi = async (page = 1, limit = 10, search?: string): Promise<{ data: Setting[]; meta: ApiResponse<Setting[]>['meta'] }> => {
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });
  const response: ApiResponse<Setting[]> = await apiFetch(`/settings?${query}`);
  return { data: response.data || [], meta: response.meta };
};

export const getSettingByIdApi = async (id: string): Promise<Setting> => {
  const response: ApiResponse<Setting> = await apiFetch(`/settings/${id}`);
  return response.data;
};

export const createSettingApi = async (input: CreateSettingInput): Promise<Setting> => {
  const response: ApiResponse<Setting> = await apiFetch('/settings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.data;
};

export const updateSettingApi = async (id: string, input: UpdateSettingInput): Promise<Setting> => {
  const response: ApiResponse<Setting> = await apiFetch(`/settings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return response.data;
};

export const deleteSettingApi = async (id: string): Promise<Setting> => {
  const response: ApiResponse<Setting> = await apiFetch(`/settings/${id}`, {
    method: 'DELETE',
  });
  return response.data;
};
