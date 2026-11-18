import { apiFetch } from "@/lib/api";
import type { ExaminationFilters, ExaminationInput, ExaminationListResult, ExaminationStats } from "../types";

interface ApiResponse<T> { data: T; }

export async function getExaminationsApi(params: ExaminationFilters = {}): Promise<ExaminationListResult> {
  const query = new URLSearchParams({ page: String(params.page ?? 1), limit: String(params.limit ?? 10) });
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.classSubjectId) query.set("classSubjectId", params.classSubjectId);
  if (params.assignmentTypeId) query.set("assignmentTypeId", params.assignmentTypeId);
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  const response = await apiFetch(`/examinations?${query.toString()}`) as ApiResponse<ExaminationListResult>;
  return response.data;
}

export async function getExaminationStatsApi(): Promise<ExaminationStats> {
  const response = await apiFetch("/examinations/stats") as ApiResponse<ExaminationStats>;
  return response.data;
}

export async function createExaminationApi(input: ExaminationInput) {
  const response = await apiFetch("/examinations", { method: "POST", body: JSON.stringify(input) }) as ApiResponse<unknown>;
  return response.data;
}

export async function updateExaminationApi(id: string, input: Partial<ExaminationInput>) {
  const response = await apiFetch(`/examinations/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) }) as ApiResponse<unknown>;
  return response.data;
}

export async function deleteExaminationApi(id: string) {
  await apiFetch(`/examinations/${encodeURIComponent(id)}`, { method: "DELETE" });
  return { id };
}
