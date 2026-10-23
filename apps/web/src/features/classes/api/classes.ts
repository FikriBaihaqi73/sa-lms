import { apiFetch } from "@/lib/api";
import type { ApiResponse, ClassItem, CreateClassInput, UpdateClassInput } from "../types";

export const getClassesApi = async (params?: { page?: number; limit?: number; search?: string }) => {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.search) qs.set("search", params.search);
  const response: ApiResponse<ClassItem[] | { data: ClassItem[] }> = await apiFetch(`/classes?${qs.toString()}`);
  const data = response.data;
  const rawArray = Array.isArray(data) ? data : (data as any)?.data ?? [];
  return { data: rawArray as ClassItem[], meta: response.meta };
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