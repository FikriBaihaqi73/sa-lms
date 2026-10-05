import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSettingApi,
  deleteSettingApi,
  getSettingsApi,
  updateSettingApi,
} from '../api/settings';
import type { CreateSettingInput, UpdateSettingInput } from '../types';

export const settingsKeys = {
  all: ['settings'] as const,
  lists: () => [...settingsKeys.all, 'list'] as const,
  list: (params: { page: number; limit: number; search?: string }) =>
    [...settingsKeys.lists(), params] as const,
};

export const useSettings = (params: { page: number; limit: number; search?: string }) => {
  return useQuery({
    queryKey: settingsKeys.list(params),
    queryFn: () => getSettingsApi(params.page, params.limit, params.search),
  });
};

export const useCreateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSettingInput) => createSettingApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
    },
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSettingInput }) =>
      updateSettingApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
    },
  });
};

export const useDeleteSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSettingApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.lists() });
    },
  });
};
