import { apiFetch } from "@/lib/api";
import type {
  Guardian,
  GuardianOptionListResult,
  StudentGuardian,
  StudentGuardianInput,
  StudentGuardianListResult,
  StudentGuardianOptionListResult,
  StudentGuardianPageMeta,
  StudentGuardianStudent,
} from "../types";

interface ApiResponse<T> {
  data: T;
  meta?: {
    totalData?: number;
    totalPages?: number;
    currentPage?: number;
    perPage?: number;
  };
}

/** Meta shape returned by the /student-guardians/options/students endpoint. */
interface StudentOptionsMeta {
  totalData?: number;
  totalPages?: number;
  currentPage?: number;
  perPage?: number;
}

interface StudentOptionsResponse {
  data: StudentGuardianStudent[];
  meta?: StudentOptionsMeta;
}

export interface GetStudentGuardiansParams {
  page: number;
  limit: number;
  search?: string;
}

export interface GetStudentGuardianOptionsParams {
  page: number;
  limit: number;
  search?: string;
}

const emptyMeta = (page: number, limit: number): StudentGuardianPageMeta => ({
  page,
  limit,
  total: 0,
  totalPages: 0,
});

export async function getStudentGuardiansApi({
  page,
  limit,
  search,
}: GetStudentGuardiansParams): Promise<StudentGuardianListResult> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search?.trim()) params.set("search", search.trim());
  const response: ApiResponse<StudentGuardian[]> = await apiFetch(
    `/student-guardians?${params.toString()}`,
  );
  const meta = response.meta;
  return {
    data: response.data ?? [],
    meta: {
      page: meta?.currentPage ?? page,
      limit: meta?.perPage ?? limit,
      total: meta?.totalData ?? 0,
      totalPages: meta?.totalPages ?? 0,
    },
  };
}

export async function getStudentGuardianByIdApi(id: string): Promise<StudentGuardian> {
  const response: ApiResponse<StudentGuardian> = await apiFetch(
    `/student-guardians/${id}`,
  );
  return response.data;
}

/**
 * Fetch one paginated, searchable page of students for the relation form.
 * Uses the institution-scoped /student-guardians/options/students endpoint so
 * only students from the logged-in admin institution are selectable.
 */
export async function getStudentOptionsApi({
  page,
  limit,
  search,
}: GetStudentGuardianOptionsParams): Promise<StudentGuardianOptionListResult> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search?.trim()) params.set("search", search.trim());
  const response: ApiResponse<StudentOptionsResponse> = await apiFetch(
    `/student-guardians/options/students?${params.toString()}`,
  );
  const options = response.data;
  return {
    data: options?.data ?? [],
    meta: options?.meta
      ? {
          page: options.meta.currentPage ?? page,
          limit: options.meta.perPage ?? limit,
          total: options.meta.totalData ?? 0,
          totalPages: options.meta.totalPages ?? 0,
        }
      : emptyMeta(page, limit),
  };
}

/**
 * Fetch one paginated, searchable page of guardians for the relation form.
 * Uses the existing /guardians endpoint (server-side search + pagination) so
 * guardians beyond the first page remain selectable.
 */
export async function getGuardianOptionsApi({
  page,
  limit,
  search,
}: GetStudentGuardianOptionsParams): Promise<GuardianOptionListResult> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search?.trim()) params.set("search", search.trim());
  const response: ApiResponse<Guardian[]> = await apiFetch(
    `/guardians?${params.toString()}`,
  );
  return {
    data: response.data ?? [],
    meta: {
      page: response.meta?.currentPage ?? page,
      limit: response.meta?.perPage ?? limit,
      total: response.meta?.totalData ?? 0,
      totalPages: response.meta?.totalPages ?? 0,
    },
  };
}

export async function createStudentGuardianApi(
  input: StudentGuardianInput,
): Promise<StudentGuardian> {
  const response: ApiResponse<StudentGuardian> = await apiFetch("/student-guardians", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function updateStudentGuardianApi(
  id: string,
  input: StudentGuardianInput,
): Promise<StudentGuardian> {
  const response: ApiResponse<StudentGuardian> = await apiFetch(
    `/student-guardians/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  return response.data;
}

export async function deleteStudentGuardianApi(id: string): Promise<void> {
  await apiFetch(`/student-guardians/${id}`, { method: "DELETE" });
}
