import { apiFetch } from "@/lib/api";
import type {
  Attendance,
  AttendanceFilters,
  AttendanceListResponse,
  AttendancePaginationMeta,
  AttendanceSummary,
  CreateAttendanceInput,
  UpdateAttendanceInput,
} from "../types";

interface ApiResponse<T> {
  data: T;
  meta?: AttendancePaginationMeta;
  message?: string;
  status?: string;
}

export const getAttendancesApi = async (
  params: AttendanceFilters,
): Promise<AttendanceListResponse> => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.student_id) query.set("student_id", params.student_id);
  if (params.attendance_status_id) query.set("attendance_status_id", params.attendance_status_id);
  if (params.schedule_id) query.set("schedule_id", params.schedule_id);
  if (params.class_id) query.set("class_id", params.class_id);
  if (params.attendance_date) query.set("attendance_date", params.attendance_date);

  const response = (await apiFetch(`/attendances?${query.toString()}`)) as {
    data?: Attendance[] | { data?: Attendance[]; meta?: AttendancePaginationMeta } | null;
    meta?: AttendancePaginationMeta;
  };

  if (Array.isArray(response?.data)) {
    const meta = response.meta ?? {
      currentPage: params.page,
      perPage: params.limit,
      totalData: response.data.length,
      totalPages: Math.max(1, Math.ceil(response.data.length / params.limit)),
    };
    return {
      data: response.data,
      meta,
    };
  }

  if (response?.data && Array.isArray(response.data.data)) {
    const meta = response.data.meta ?? {
      currentPage: params.page,
      perPage: params.limit,
      totalData: response.data.data.length,
      totalPages: Math.max(1, Math.ceil(response.data.data.length / params.limit)),
    };
    return {
      data: response.data.data,
      meta,
    };
  }

  return {
    data: [],
    meta: {
      currentPage: params.page,
      perPage: params.limit,
      totalData: 0,
      totalPages: 1,
    },
  };
};

export const getAttendanceSummaryApi = async (params?: {
  class_id?: string;
  schedule_id?: string;
  attendance_date?: string;
  search?: string;
}): Promise<AttendanceSummary> => {
  const query = new URLSearchParams();
  if (params?.class_id) query.set("class_id", params.class_id);
  if (params?.schedule_id) query.set("schedule_id", params.schedule_id);
  if (params?.attendance_date) query.set("attendance_date", params.attendance_date);
  if (params?.search?.trim()) query.set("search", params.search.trim());

  const response = (await apiFetch(`/attendances/summary?${query.toString()}`)) as ApiResponse<AttendanceSummary>;
  return response.data ?? {
    total: 0,
    present: 0,
    permission: 0,
    sick: 0,
    absent: 0,
    attendanceRate: 0,
  };
};

export const getAttendanceByIdApi = async (id: string): Promise<Attendance> => {
  const response = (await apiFetch(`/attendances/${id}`)) as ApiResponse<Attendance>;
  return response.data;
};

export const createAttendanceApi = async (
  input: CreateAttendanceInput,
): Promise<Attendance> => {
  const response = (await apiFetch("/attendances", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })) as ApiResponse<Attendance>;
  return response.data;
};

export const updateAttendanceApi = async (
  id: string,
  input: UpdateAttendanceInput,
): Promise<Attendance> => {
  const response = (await apiFetch(`/attendances/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })) as ApiResponse<Attendance>;
  return response.data;
};

export const deleteAttendanceApi = async (id: string): Promise<void> => {
  await apiFetch(`/attendances/${id}`, {
    method: "DELETE",
  });
};

