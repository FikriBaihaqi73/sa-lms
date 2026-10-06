import { apiFetch } from '@/lib/api';
import type {
  ApiResponse,
  AttendanceStatus,
  AttendanceStatusPageMeta,
  AttendanceStatusesResponse,
  CreateAttendanceStatusInput,
  DeleteAttendanceStatusResult,
  UpdateAttendanceStatusInput,
} from '../types';

export interface GetAttendanceStatusesParams {
  page: number;
  limit: number;
  search?: string;
}

export async function getAttendanceStatuses({
  page,
  limit,
  search,
}: GetAttendanceStatusesParams): Promise<AttendanceStatusesResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const normalizedSearch = search?.trim();
  if (normalizedSearch) params.set('search', normalizedSearch);

  const response = (await apiFetch(`/attendance-statuses?${params.toString()}`)) as ApiResponse<AttendanceStatus[]>;
  const responseMeta = response.meta;
  const meta: AttendanceStatusPageMeta = {
    page: responseMeta?.currentPage ?? page,
    limit: responseMeta?.perPage ?? limit,
    total: responseMeta?.totalData ?? response.data.length,
    totalPages: responseMeta?.totalPages ?? (response.data.length > 0 ? 1 : 0),
  };

  return { data: response.data ?? [], meta };
}

export async function getAttendanceStatus(id: string): Promise<AttendanceStatus> {
  const response = (await apiFetch(`/attendance-statuses/${id}`)) as ApiResponse<AttendanceStatus>;
  return response.data;
}

export async function createAttendanceStatus(
  input: CreateAttendanceStatusInput,
): Promise<AttendanceStatus> {
  const response = (await apiFetch('/attendance-statuses', {
    method: 'POST',
    body: JSON.stringify(input),
  })) as ApiResponse<AttendanceStatus>;
  return response.data;
}

export async function updateAttendanceStatus(
  id: string,
  input: UpdateAttendanceStatusInput,
): Promise<AttendanceStatus> {
  const response = (await apiFetch(`/attendance-statuses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })) as ApiResponse<AttendanceStatus>;
  return response.data;
}

export async function deleteAttendanceStatus(id: string): Promise<DeleteAttendanceStatusResult> {
  const response = (await apiFetch(`/attendance-statuses/${id}`, {
    method: 'DELETE',
  })) as ApiResponse<DeleteAttendanceStatusResult>;
  return response.data;
}
