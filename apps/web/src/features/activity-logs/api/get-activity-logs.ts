import { apiFetch } from '@/lib/api';
import type { ActivityLogListResponse } from '../types';

export const getActivityLogs = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<ActivityLogListResponse> => {
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search ? { search } : {}),
  });

  const response = await apiFetch(`/activity-logs?${query.toString()}`);
  return response;
};
