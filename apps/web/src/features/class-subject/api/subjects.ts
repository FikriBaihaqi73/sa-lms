import { apiFetch } from "@/lib/api";

export interface SubjectOption {
  id: string;
  name: string;
}

interface SubjectPage {
  data: SubjectOption[];
  total: number;
}

export async function getSubjectsApi(page = 1, limit = 100): Promise<{ data: SubjectOption[]; total: number }> {
  let current: unknown = await apiFetch(`/subjects?page=${page}&limit=${limit}`);
  let total = 0;
  for (let depth = 0; depth < 4; depth += 1) {
    if (!current || typeof current !== "object" || Array.isArray(current)) break;
    const record = current as { data?: unknown; total?: unknown };
    if (typeof record.total === "number") total = record.total;
    if (Array.isArray(record.data)) {
      const data = record.data as SubjectOption[];
      return { data, total: total || data.length };
    }
    current = record.data;
  }
  return { data: [], total };
}

export async function getAllSubjectsApi(): Promise<SubjectOption[]> {
  const first: SubjectPage = await getSubjectsApi(1, 100);
  const totalPages = Math.ceil(first.total / 100);
  const pages = await Promise.all(
    Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) => getSubjectsApi(index + 2, 100)),
  );
  return [first.data, ...pages.map((page) => page.data)].flat();
}
