import { apiFetch } from "@/lib/api";
import type {
  CreateStudentInput,
  Student,
  StudentDepartmentListResult,
  StudentListResult,
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
  const response: ApiResponse<StudentProfileListResult | null> = await apiFetch(
    "/profiles?page=1&limit=100",
  );
  return response.data ?? { data: [], meta: { page: 1, limit: 100, total: 0, totalPages: 0 } };
};

export const getStudentDepartmentsApi = async (): Promise<StudentDepartmentListResult> => {
  const response: ApiResponse<StudentDepartmentListResult | null> = await apiFetch(
    "/departments?page=1&limit=100",
  );
  return response.data ?? {
    data: [],
    meta: { totalData: 0, totalPages: 0, currentPage: 1, perPage: 100 },
  };
};

