import { apiFetch } from "@/lib/api";
import type {
  ApiResponse,
  ClassItem,
  ClassListResult,
  CreateClassInput,
  UpdateClassInput,
} from "../types";

export const getClassesApi = async (
  params: { page?: number; limit?: number; search?: string } = {},
): Promise<ClassListResult> => {
  const qs = new URLSearchParams();
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  qs.set("page", String(page));
  qs.set("limit", String(limit));
  if (params.search?.trim()) qs.set("search", params.search.trim());

  const response: ApiResponse<ClassItem[]> = await apiFetch(`/classes?${qs.toString()}`);
  const meta = response.meta ?? { page, limit, total: 0, totalPages: 0 };
  return {
    data: response.data ?? [],
    meta: {
      page: meta.page ?? page,
      limit: meta.limit ?? limit,
      total: meta.total ?? 0,
      totalPages: meta.totalPages ?? 0,
    },
  };
};

export const createClassApi = async (input: CreateClassInput) => {
  const response: ApiResponse<ClassItem> = await apiFetch("/classes", { method: "POST", body: JSON.stringify(input) });
  return response.data as ClassItem;
};

export const updateClassApi = async (id: string, input: UpdateClassInput) => {
  const response: ApiResponse<ClassItem> = await apiFetch(`/classes/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  return response.data as ClassItem;
};

export const deleteClassApi = async (id: string) => {
  await apiFetch(`/classes/${id}`, { method: "DELETE" });
  return { success: true, id };
};
