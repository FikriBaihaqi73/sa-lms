import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAttendanceStatus,
  deleteAttendanceStatus,
  getAttendanceStatus,
  getAttendanceStatuses,
  updateAttendanceStatus,
  type GetAttendanceStatusesParams,
} from '../api/attendance-statuses';
import type {
  CreateAttendanceStatusInput,
  UpdateAttendanceStatusInput,
} from '../types';

export const ATTENDANCE_STATUSES_QUERY_KEY = ['attendance-statuses'] as const;

export function useAttendanceStatuses(params: GetAttendanceStatusesParams) {
  return useQuery({
    queryKey: [...ATTENDANCE_STATUSES_QUERY_KEY, params.page, params.limit, params.search ?? ''],
    queryFn: () => getAttendanceStatuses(params),
    placeholderData: keepPreviousData,
  });
}

export function useAttendanceStatus(id?: string) {
  return useQuery({
    queryKey: [...ATTENDANCE_STATUSES_QUERY_KEY, 'detail', id],
    queryFn: () => getAttendanceStatus(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateAttendanceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAttendanceStatusInput) => createAttendanceStatus(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ATTENDANCE_STATUSES_QUERY_KEY }),
  });
}

export function useUpdateAttendanceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAttendanceStatusInput }) =>
      updateAttendanceStatus(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ATTENDANCE_STATUSES_QUERY_KEY }),
  });
}

export function useDeleteAttendanceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAttendanceStatus(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ATTENDANCE_STATUSES_QUERY_KEY }),
  });
}
