import { apiFetch } from "@/lib/api";
import type {
  ApiResponse,
  CreateDepartmentInput,
  Department,
  DepartmentListResponse,
  UpdateDepartmentInput,
} from "../types";

export interface GetDepartmentsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getDepartmentsApi = async (
  params?: GetDepartmentsParams,
): Promise<DepartmentListResponse> => {
  const query = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 10),
    ...(params?.search ? { search: params.search } : {}),
  });

  const response: ApiResponse<Department[]> = await apiFetch(
    `/departments?${query.toString()}`,
  );

  return {
    data: Array.isArray(response.data) ? response.data : [],
    meta: response.meta ?? {
      totalData: 0,
      totalPages: 1,
      currentPage: params?.page ?? 1,
      perPage: params?.limit ?? 10,
    },
  };
};

export const getDepartmentByIdApi = async (id: string): Promise<Department> => {
  const response: ApiResponse<Department> = await apiFetch(`/departments/${id}`);
  if (!response.data) {
    throw new Error("Data departemen tidak ditemukan.");
  }
  return response.data;
};

export const createDepartmentApi = async (
  input: CreateDepartmentInput,
): Promise<Department> => {
  const response: ApiResponse<Department> = await apiFetch("/departments", {
    method: "POST",
    body: JSON.stringify({
      name: input.name.trim(),
      code: input.code.trim(),
      ...(input.teacher_ids && input.teacher_ids.length > 0
        ? { teacher_ids: input.teacher_ids }
        : {}),
    }),
  });

  if (!response.data) {
    throw new Error("Gagal membuat data departemen.");
  }
  return response.data;
};

export const updateDepartmentApi = async (
  id: string,
  input: UpdateDepartmentInput,
): Promise<Department> => {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.code !== undefined) payload.code = input.code.trim();
  if (input.teacher_ids !== undefined) payload.teacher_ids = input.teacher_ids;

  const response: ApiResponse<Department> = await apiFetch(`/departments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!response.data) {
    throw new Error("Gagal memperbarui data departemen.");
  }
  return response.data;
};

export const deleteDepartmentApi = async (
  id: string,
): Promise<{ success: boolean; id: string }> => {
  const response: ApiResponse<{ success: boolean; id: string }> = await apiFetch(
    `/departments/${id}`,
    {
      method: "DELETE",
    },
  );

  return response.data ?? { success: true, id };
};
