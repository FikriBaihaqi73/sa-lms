import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAttendanceApi,
  deleteAttendanceApi,
  getAttendanceByIdApi,
  getAttendancesApi,
  getAttendanceSummaryApi,
  updateAttendanceApi,
} from "../api/attendances";
import type {
  AttendanceFilters,
  CreateAttendanceInput,
  UpdateAttendanceInput,
} from "../types";

export const ATTENDANCES_QUERY_KEY = ["attendances"] as const;
export const ATTENDANCE_SUMMARY_QUERY_KEY = ["attendance-summary"] as const;

export const useAttendances = (filters: AttendanceFilters) => {
  return useQuery({
    queryKey: [
      ...ATTENDANCES_QUERY_KEY,
      filters.page,
      filters.limit,
      filters.search ?? "",
      filters.class_id ?? "",
      filters.schedule_id ?? "",
      filters.student_id ?? "",
      filters.attendance_status_id ?? "",
      filters.attendance_date ?? "",
    ],
    queryFn: () => getAttendancesApi(filters),
    placeholderData: keepPreviousData,
  });
};

export const useAttendanceSummary = (filters?: {
  class_id?: string;
  schedule_id?: string;
  attendance_date?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: [
      ...ATTENDANCE_SUMMARY_QUERY_KEY,
      filters?.class_id ?? "",
      filters?.schedule_id ?? "",
      filters?.attendance_date ?? "",
      filters?.search ?? "",
    ],
    queryFn: () => getAttendanceSummaryApi(filters),
    placeholderData: keepPreviousData,
  });
};

export const useAttendance = (id?: string) => {
  return useQuery({
    queryKey: [...ATTENDANCES_QUERY_KEY, "detail", id],
    queryFn: () => getAttendanceByIdApi(id as string),
    enabled: Boolean(id),
  });
};

export const useCreateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAttendanceInput) => createAttendanceApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_SUMMARY_QUERY_KEY });
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAttendanceInput }) =>
      updateAttendanceApi(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_SUMMARY_QUERY_KEY });
    },
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAttendanceApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_SUMMARY_QUERY_KEY });
    },
  });
};

