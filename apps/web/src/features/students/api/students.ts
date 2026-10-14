import { apiFetch } from "@/lib/api";
import type {
  CreateStudentInput,
  Student,
  StudentDepartment,
  StudentDepartmentListResult,
  StudentListResult,
  StudentPageMeta,
  StudentProfile,
  StudentProfileListResult,
  UpdateStudentInput,
} from "../types";

interface ApiResponse<T> {
  data: T;
  meta?: unknown;
}

export interface GetStudentsParams {
  page: number;
  limit: number;
  search?: string;
}

const emptyStudentPage = (page: number, limit: number): StudentListResult => ({
  data: [],
  meta: { page, limit, total: 0, totalPages: 0 },
});

export const getStudentsApi = async ({ page, limit, search }: GetStudentsParams): Promise<StudentListResult> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search?.trim()) params.set("search", search.trim());

  const response: ApiResponse<StudentListResult | null> = await apiFetch(`/students?${params.toString()}`);
  return response.data ?? emptyStudentPage(page, limit);
};

export const getStudentByIdApi = async (id: string): Promise<Student> => {
  const response: ApiResponse<Student> = await apiFetch(`/students/${id}`);
  return response.data;
};

export const createStudentApi = async (input: CreateStudentInput): Promise<Student> => {
  const response: ApiResponse<Student> = await apiFetch("/students", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
};

export const updateStudentApi = async (id: string, input: UpdateStudentInput): Promise<Student> => {
  const response: ApiResponse<Student> = await apiFetch(`/students/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return response.data;
};

export const deleteStudentApi = async (id: string): Promise<{ id: string }> => {
  const response: ApiResponse<{ id: string }> = await apiFetch(`/students/${id}`, {
    method: "DELETE",
  });
  return response.data ?? { id };
};

export const getStudentProfilesApi = async (): Promise<StudentProfileListResult> => {
  const response = (await apiFetch("/profiles?page=1&limit=100")) as {
    data?: StudentProfile[] | { data?: StudentProfile[]; meta?: StudentPageMeta };
  };
  const rawList: StudentProfile[] = Array.isArray(response.data)
    ? response.data
    : Array.isArray(response.data?.data)
      ? response.data.data
      : [];
  return {
    data: rawList,
    meta: { page: 1, limit: 100, total: rawList.length, totalPages: 1 },
  };
};

export const getStudentDepartmentsApi = async (): Promise<StudentDepartmentListResult> => {
  const response = (await apiFetch("/departments?page=1&limit=100")) as {
    data?: StudentDepartment[] | { data?: StudentDepartment[] };
    meta?: { totalData?: number; totalPages?: number; currentPage?: number; perPage?: number };
  };
  const rawList: StudentDepartment[] = Array.isArray(response.data)
    ? response.data
    : Array.isArray(response.data?.data)
      ? response.data.data
      : [];
  return {
    data: rawList,
    meta: {
      totalData: response.meta?.totalData ?? rawList.length,
      totalPages: response.meta?.totalPages ?? 1,
      currentPage: response.meta?.currentPage ?? 1,
      perPage: response.meta?.perPage ?? 100,
    },
  };
};

