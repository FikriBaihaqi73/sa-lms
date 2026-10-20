import { apiFetch } from "@/lib/api";
import type {
  ApiResponse,
  CreateGradeInput,
  StandardGrade,
  UpdateGradeInput,
} from "../types";
import { parseScore } from "../types";

/**
 * Petakan item dari endpoint /grades ke interface StandardGrade.
 */
export function toStandardGrade(raw: Record<string, unknown>): StandardGrade {
  return {
    id: String(raw.id ?? ""),
    grade: String(raw.grade ?? ""),
    minimumScore: parseScore(raw.minimumScore),
    maximumScore: parseScore(raw.maximumScore),
    description:
      raw.description != null && String(raw.description).trim() !== ""
        ? String(raw.description)
        : null,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}

/**
 * Ambil seluruh data standar penilaian (skala/rubrik).
 */
export const getGradesApi = async (): Promise<StandardGrade[]> => {
  const response: ApiResponse<unknown> = await apiFetch("/grades");
  const data = response.data;

  const rawArray: unknown[] = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)
      ? ((data as { data: unknown[] }).data ?? [])
      : [];

  return (rawArray as Record<string, unknown>[]).map(toStandardGrade);
};

/**
 * Ambil detail satu standar penilaian berdasarkan ID.
 */
export const getGradeByIdApi = async (id: string): Promise<StandardGrade> => {
  const response: ApiResponse<Record<string, unknown>> = await apiFetch(`/grades/${id}`);
  if (!response.data || typeof response.data !== "object") {
    throw new Error("Data standar penilaian tidak ditemukan.");
  }
  return toStandardGrade(response.data);
};

/**
 * Buat standar penilaian baru.
 */
export const createGradeApi = async (
  input: CreateGradeInput,
): Promise<StandardGrade> => {
  const payload: Record<string, unknown> = {
    grade: input.grade.trim(),
    ...(input.minimumScore != null ? { minimumScore: input.minimumScore } : {}),
    ...(input.maximumScore != null ? { maximumScore: input.maximumScore } : {}),
    ...(input.description ? { description: input.description.trim() } : {}),
  };

  const response: ApiResponse<Record<string, unknown>> = await apiFetch("/grades", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.data || typeof response.data !== "object") {
    throw new Error("Gagal membuat standar nilai.");
  }
  return toStandardGrade(response.data);
};

/**
 * Perbarui standar penilaian yang sudah ada.
 */
export const updateGradeApi = async (
  id: string,
  input: UpdateGradeInput,
): Promise<StandardGrade> => {
  const payload: Record<string, unknown> = {};

  if (input.grade !== undefined) {
    payload.grade = input.grade.trim();
  }
  if (input.minimumScore !== undefined && input.minimumScore != null) {
    payload.minimumScore = input.minimumScore;
  }
  if (input.maximumScore !== undefined && input.maximumScore != null) {
    payload.maximumScore = input.maximumScore;
  }
  if (input.description !== undefined) {
    payload.description = input.description ? input.description.trim() : "";
  }

  const response: ApiResponse<Record<string, unknown>> = await apiFetch(`/grades/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!response.data || typeof response.data !== "object") {
    throw new Error("Gagal memperbarui standar nilai.");
  }
  return toStandardGrade(response.data);
};

/**
 * Hapus (soft delete) standar penilaian.
 */
export const deleteGradeApi = async (
  id: string,
): Promise<{ success: boolean; id: string }> => {
  const response: ApiResponse<{ success: boolean; id: string }> = await apiFetch(
    `/grades/${id}`,
    {
      method: "DELETE",
    },
  );

  return response.data ?? { success: true, id };
};
