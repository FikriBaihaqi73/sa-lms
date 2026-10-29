import { apiFetch } from "@/lib/api";
import type {
  SubjectApiItem,
  SubjectPrerequisiteRelation,
} from "../types";

export async function fetchSubjectPrerequisitesApi(
  page = 1,
  limit = 200,
  search?: string,
): Promise<{ data: SubjectPrerequisiteRelation[]; total: number }> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search?.trim()) {
    query.set("search", search.trim());
  }

  let current: unknown = await apiFetch(`/subject-prerequisites?${query.toString()}`);
  let total = 0;

  for (let depth = 0; depth < 4; depth += 1) {
    if (!current || typeof current !== "object") break;

    if (Array.isArray(current)) {
      return { data: current as SubjectPrerequisiteRelation[], total: total || current.length };
    }

    const record = current as { data?: unknown; total?: unknown; meta?: { totalData?: number } };
    if (typeof record.meta?.totalData === "number") {
      total = record.meta.totalData;
    } else if (typeof record.total === "number") {
      total = record.total;
    }

    if (Array.isArray(record.data)) {
      const data = record.data as SubjectPrerequisiteRelation[];
      return { data, total: total || data.length };
    }

    current = record.data;
  }

  return { data: [], total };
}

export async function fetchSubjectsApi(
  page = 1,
  limit = 200,
  search?: string,
): Promise<{ data: SubjectApiItem[]; total: number }> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search?.trim()) {
    query.set("search", search.trim());
  }

  let current: unknown = await apiFetch(`/subjects?${query.toString()}`);
  let total = 0;

  for (let depth = 0; depth < 4; depth += 1) {
    if (!current || typeof current !== "object") break;

    if (Array.isArray(current)) {
      return { data: current as SubjectApiItem[], total: total || current.length };
    }

    const record = current as { data?: unknown; total?: unknown; meta?: { totalData?: number } };
    if (typeof record.meta?.totalData === "number") {
      total = record.meta.totalData;
    } else if (typeof record.total === "number") {
      total = record.total;
    }

    if (Array.isArray(record.data)) {
      const data = record.data as SubjectApiItem[];
      return { data, total: total || data.length };
    }

    current = record.data;
  }

  return { data: [], total };
}

export async function createSubjectPrerequisiteApi(
  subjectId: string,
  prerequisiteSubjectId: string,
): Promise<SubjectPrerequisiteRelation> {
  const response = (await apiFetch("/subject-prerequisites", {
    method: "POST",
    body: JSON.stringify({ subjectId, prerequisiteSubjectId }),
  })) as { data?: SubjectPrerequisiteRelation };

  return (response.data ?? response) as SubjectPrerequisiteRelation;
}

export async function deleteSubjectPrerequisiteApi(
  id: string,
): Promise<{ id: string }> {
  await apiFetch(`/subject-prerequisites/${id}`, {
    method: "DELETE",
  });
  return { id };
}
