import { apiFetch } from "@/lib/api";
import type { StudentGradeFilters, StudentGradeInput, StudentGradeListResult, StudentGradeStats } from "../types";
interface ApiResponse<T> { data: T; }
export async function getStudentGradesApi(params: StudentGradeFilters = {}): Promise<StudentGradeListResult> {
  const query = new URLSearchParams({ page: String(params.page ?? 1), limit: String(params.limit ?? 10) });
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.classSubjectId) query.set("classSubjectId", params.classSubjectId);
  if (params.academicYearId) query.set("academicYearId", params.academicYearId);
  if (params.studentId) query.set("studentId", params.studentId);
  const response = await apiFetch(`/student-grades?${query.toString()}`) as ApiResponse<StudentGradeListResult>;
  return response.data;
}
export async function getStudentGradeStatsApi(): Promise<StudentGradeStats> { const response = await apiFetch("/student-grades/stats") as ApiResponse<StudentGradeStats>; return response.data; }
export async function createStudentGradeApi(input: StudentGradeInput) { const response = await apiFetch("/student-grades", { method: "POST", body: JSON.stringify(input) }) as ApiResponse<unknown>; return response.data; }
export async function updateStudentGradeApi(id: string, input: Partial<Omit<StudentGradeInput, "studentId" | "classSubjectId" | "academicYearId">>) { const response = await apiFetch(`/student-grades/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) }) as ApiResponse<unknown>; return response.data; }
export async function deleteStudentGradeApi(id: string) { await apiFetch(`/student-grades/${encodeURIComponent(id)}`, { method: "DELETE" }); return { id }; }
