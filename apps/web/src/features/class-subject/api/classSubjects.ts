import { apiFetch } from "@/lib/api";
import { getClassesApi } from "@/features/classes/api/classes";
import { getTeachersApi } from "@/features/teachers/api/teachers";
import { listAcademicYearsApi } from "@/features/academic-years/api/academic-years";
import { getAllSubjectsApi } from "./subjects";
import type { ClassSubjectFilters, ClassSubjectInput, ClassSubjectListResult, ClassSubjectOptions } from "../types";

interface ApiResponse<T> {
  data: T | null;
  meta?: ClassSubjectListResult["meta"];
}

export async function getClassSubjectsApi(params: ClassSubjectFilters = {}): Promise<ClassSubjectListResult> {
  const query = new URLSearchParams({ page: String(params.page ?? 1), limit: String(params.limit ?? 10) });
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.class_id) query.set("class_id", params.class_id);
  if (params.academic_year_id) query.set("academic_year_id", params.academic_year_id);
  if (params.teacher_id) query.set("teacher_id", params.teacher_id);
  const response: ApiResponse<unknown> = await apiFetch(`/class-subjects?${query.toString()}`);
  return {
    data: Array.isArray(response.data) ? response.data as ClassSubjectListResult["data"] : [],
    meta: response.meta ?? { totalData: 0, totalPages: 0, currentPage: params.page ?? 1, perPage: params.limit ?? 10 },
  };
}

export async function createClassSubjectApi(input: ClassSubjectInput) {
  const response: ApiResponse<ClassSubjectListResult["data"][number]> = await apiFetch("/class-subjects", { method: "POST", body: JSON.stringify(input) });
  return response.data;
}

export async function updateClassSubjectApi(id: string, input: Partial<ClassSubjectInput>) {
  const response: ApiResponse<ClassSubjectListResult["data"][number]> = await apiFetch(`/class-subjects/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  return response.data;
}

export async function deleteClassSubjectApi(id: string) {
  await apiFetch(`/class-subjects/${id}`, { method: "DELETE" });
  return { id };
}

export async function getAllClassSubjectOptionsApi(): Promise<ClassSubjectOptions> {
  const pageSize = 100;
  const [classesFirst, teachersFirst, subjects, academicYears] = await Promise.all([
    getClassesApi({ page: 1, limit: pageSize }),
    getTeachersApi({ page: 1, limit: pageSize }),
    getAllSubjectsApi(),
    listAcademicYearsApi(),
  ]);
  const classPages = await Promise.all(Array.from({ length: Math.max(classesFirst.meta.totalPages - 1, 0) }, (_, i) => getClassesApi({ page: i + 2, limit: pageSize })));
  const teacherPages = await Promise.all(Array.from({ length: Math.max(teachersFirst.meta.totalPages - 1, 0) }, (_, i) => getTeachersApi({ page: i + 2, limit: pageSize })));
  return {
    classes: [classesFirst.data, ...classPages.map((page) => page.data)].flat().map(({ id, name }) => ({ id, name })),
    subjects,
    teachers: [teachersFirst.data, ...teacherPages.map((page) => page.data)].flat().map(({ id, teacher_number, profile }) => ({ id, teacher_number, profile: profile ? { fullName: profile.fullName } : null })),
    academicYears: academicYears.filter((year) => year.institution_id !== null).map(({ id, academic_year, is_active, institution_id }) => ({ id, academic_year, is_active, institution_id })),
  };
}
