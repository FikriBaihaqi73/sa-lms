import { apiFetch } from "@/lib/api";
import type {
  ClassSubjectOption,
  CreateModuleContentInput,
  CreateModuleInput,
  LearningModule,
  ModuleContent,
  ModuleFilters,
  UpdateModuleContentInput,
  UpdateModuleInput,
} from "../types";

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    totalData: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}

interface RawClassSubjectItem {
  id: string;
  class?: { id: string; name: string } | null;
  subject?: { id: string; name: string } | null;
}

export async function getModules(
  filters: ModuleFilters = {},
): Promise<PaginatedResult<LearningModule>> {
  const query = new URLSearchParams();
  if (filters.page) query.set("page", String(filters.page));
  if (filters.limit) query.set("limit", String(filters.limit));
  if (filters.search) query.set("search", filters.search);
  if (filters.class_subject_id)
    query.set("class_subject_id", filters.class_subject_id);
  if (filters.is_published) query.set("is_published", filters.is_published);
  if (filters.is_locked) query.set("is_locked", filters.is_locked);

  const endpoint = `/modules${query.toString() ? `?${query.toString()}` : ""}`;
  const res = (await apiFetch(endpoint)) as {
    data?: LearningModule[];
    meta?: PaginatedResult<LearningModule>["meta"];
  };
  return {
    data: res.data || [],
    meta: res.meta || {
      totalData: (res.data || []).length,
      totalPages: 1,
      currentPage: filters.page || 1,
      perPage: filters.limit || 10,
    },
  };
}

export async function getModuleById(id: string): Promise<LearningModule> {
  const res = (await apiFetch(`/modules/${id}`)) as { data: LearningModule };
  return res.data;
}

export async function createModule(
  data: CreateModuleInput,
): Promise<LearningModule> {
  const res = (await apiFetch("/modules", {
    method: "POST",
    body: JSON.stringify(data),
  })) as { data: LearningModule };
  return res.data;
}

export async function updateModule(
  id: string,
  data: UpdateModuleInput,
): Promise<LearningModule> {
  const res = (await apiFetch(`/modules/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })) as { data: LearningModule };
  return res.data;
}

export async function deleteModule(
  id: string,
): Promise<{ success: boolean; id: string }> {
  const res = (await apiFetch(`/modules/${id}`, {
    method: "DELETE",
  })) as { data: { success: boolean; id: string } };
  return res.data;
}

export async function getModuleContents(
  filters: {
    moduleId?: string;
    search?: string;
    contentType?: string;
    page?: number;
    limit?: number;
  } = {},
): Promise<PaginatedResult<ModuleContent>> {
  const query = new URLSearchParams();
  if (filters.page) query.set("page", String(filters.page));
  if (filters.limit) query.set("limit", String(filters.limit));
  if (filters.search) query.set("search", filters.search);
  if (filters.moduleId) query.set("moduleId", filters.moduleId);
  if (filters.contentType) query.set("contentType", filters.contentType);

  const endpoint = `/module-contents${query.toString() ? `?${query.toString()}` : ""}`;
  const res = (await apiFetch(endpoint)) as {
    data?: ModuleContent[];
    meta?: PaginatedResult<ModuleContent>["meta"];
  };
  return {
    data: res.data || [],
    meta: res.meta || {
      totalData: (res.data || []).length,
      totalPages: 1,
      currentPage: filters.page || 1,
      perPage: filters.limit || 10,
    },
  };
}

export async function createModuleContent(
  data: CreateModuleContentInput,
): Promise<ModuleContent> {
  const res = (await apiFetch("/module-contents", {
    method: "POST",
    body: JSON.stringify(data),
  })) as { data: ModuleContent };
  return res.data;
}

export async function updateModuleContent(
  id: string,
  data: UpdateModuleContentInput,
): Promise<ModuleContent> {
  const res = (await apiFetch(`/module-contents/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })) as { data: ModuleContent };
  return res.data;
}

export async function deleteModuleContent(
  id: string,
): Promise<{ success: boolean; id: string }> {
  const res = (await apiFetch(`/module-contents/${id}`, {
    method: "DELETE",
  })) as { data: { success: boolean; id: string } };
  return res.data;
}

export async function getClassSubjectOptions(): Promise<ClassSubjectOption[]> {
  const res = (await apiFetch("/class-subjects?page=1&limit=100")) as {
    data?: RawClassSubjectItem[];
  };
  const rawList = res.data || [];
  return rawList.map((cs) => {
    const subjectName = cs.subject?.name || "Mata Pelajaran";
    const className = cs.class?.name || "Kelas";
    return {
      id: cs.id,
      label: `${subjectName} - ${className}`,
      className,
      subjectName,
    };
  });
}

