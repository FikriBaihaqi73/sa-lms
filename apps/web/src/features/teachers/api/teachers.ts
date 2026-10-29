import { apiFetch } from "@/lib/api";
import type {
  CreateTeacherInput,
  Teacher,
  TeacherClassAssignment,
  TeacherFormProfile,
  TeacherListResult,
  TeacherPageMeta,
  TeacherReference,
  TeacherStats,
  UpdateTeacherInput,
} from "../types";

interface ApiResponse<T> {
  data: T;
  meta?: TeacherPageMeta;
}

export interface GetTeachersParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  specialization?: string;
}

const emptyTeacherPage = (page: number, limit: number): TeacherListResult => ({
  data: [],
  meta: { page, limit, total: 0, totalPages: 0 },
});

export const getTeachersApi = async ({
  page,
  limit,
  search,
  status,
  specialization,
}: GetTeachersParams): Promise<TeacherListResult> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search?.trim()) params.set("search", search.trim());
  if (status?.trim()) params.set("status", status.trim());
  if (specialization?.trim()) params.set("specialization", specialization.trim());

  const response = (await apiFetch(`/teachers?${params.toString()}`)) as {
    data?: Teacher[] | { data?: Teacher[]; meta?: TeacherPageMeta } | null;
    meta?: TeacherPageMeta;
  };

  // Case 1: Backend returns { data: Teacher[], meta: TeacherPageMeta }
  if (Array.isArray(response?.data)) {
    const meta = (response.meta as TeacherPageMeta) ?? {
      page,
      limit,
      total: response.data.length,
      totalPages: Math.ceil(response.data.length / limit) || 1,
    };
    return {
      data: response.data,
      meta,
    };
  }

  // Case 2: Backend returns { data: { data: Teacher[], meta: TeacherPageMeta } }
  if (response?.data && Array.isArray(response.data.data)) {
    const meta = (response.data.meta as TeacherPageMeta) ?? {
      page,
      limit,
      total: response.data.data.length,
      totalPages: Math.ceil(response.data.data.length / limit) || 1,
    };
    return {
      data: response.data.data,
      meta,
    };
  }

  return emptyTeacherPage(page, limit);
};

const defaultTeacherStats: TeacherStats = {
  total: 0,
  tetapCount: 0,
  honorerCount: 0,
  specializationCount: 0,
  totalClassAssignments: 0,
  unassignedCount: 0,
};

export const getTeacherStatsApi = async (): Promise<TeacherStats> => {
  const response: ApiResponse<TeacherStats | null> = await apiFetch("/teachers/stats");
  return response.data ?? defaultTeacherStats;
};

export const getTeacherByIdApi = async (id: string): Promise<Teacher> => {
  const response: ApiResponse<Teacher> = await apiFetch(`/teachers/${id}`);
  return response.data;
};

export const createTeacherApi = async (input: CreateTeacherInput): Promise<Teacher> => {
  const response: ApiResponse<Teacher> = await apiFetch("/teachers", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
};

export const updateTeacherApi = async (
  id: string,
  input: UpdateTeacherInput,
): Promise<Teacher> => {
  const response: ApiResponse<Teacher> = await apiFetch(`/teachers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return response.data;
};

export const deleteTeacherApi = async (id: string): Promise<{ id: string }> => {
  const response: ApiResponse<{ id: string }> = await apiFetch(`/teachers/${id}`, {
    method: "DELETE",
  });
  return response.data ?? { id };
};

export const getTeacherProfilesApi = async (): Promise<TeacherFormProfile[]> => {
  const response: ApiResponse<{ data: TeacherFormProfile[] } | TeacherFormProfile[] | null> =
    await apiFetch("/profiles?page=1&limit=100");
  if (Array.isArray(response.data)) return response.data;
  return response.data?.data ?? [];
};

export const getEmploymentStatusesApi = async (): Promise<TeacherReference[]> => {
  const response: ApiResponse<{ data: TeacherReference[] } | TeacherReference[] | null> =
    await apiFetch("/employment-statuses");
  if (Array.isArray(response.data)) return response.data;
  return response.data?.data ?? [];
};

export const getSpecializationsApi = async (): Promise<TeacherReference[]> => {
  const response: ApiResponse<{ data: TeacherReference[] } | TeacherReference[] | null> =
    await apiFetch("/specializations");
  if (Array.isArray(response.data)) return response.data;
  return response.data?.data ?? [];
};

export const getDepartmentsApi = async (): Promise<TeacherReference[]> => {
  const response: ApiResponse<{ data: TeacherReference[] } | TeacherReference[] | null> =
    await apiFetch("/departments?page=1&limit=100");
  if (Array.isArray(response.data)) return response.data;
  return response.data?.data ?? [];
};

export const getTeacherClassSubjectsApi = async (
  teacherId: string,
): Promise<TeacherClassAssignment[]> => {
  const response: ApiResponse<TeacherClassAssignment[] | null> = await apiFetch(
    `/class-subjects/teacher/${teacherId}`,
  );
  return response.data ?? [];
};
