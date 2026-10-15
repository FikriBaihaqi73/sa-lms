import { apiFetch } from "@/lib/api";
import type { ApiResponse, GradeListResponse, GradeRow, UpdateGradeInput } from "../types";
import { parseScore } from "../types";

/**
 * Petakan satu item response `/student-grades` (eager loaded) ke `GradeRow`.
 * Kolom skor dan relasi `grade` datang sebagai Decimal → string JSON dari
 * backend, dinormalkan lewat `parseScore`.
 */
export function toGradeRow(item: Record<string, unknown>, index: number): GradeRow {
  const student = (item.student ?? {}) as Record<string, unknown>;
  const profile = (student.profile ?? {}) as Record<string, unknown>;
  const classSubject = (item.classSubject ?? {}) as Record<string, unknown>;
  const clazz = (classSubject.class ?? {}) as Record<string, unknown>;
  const subject = (classSubject.subject ?? {}) as Record<string, unknown>;
  const academicYear = (item.academicYear ?? {}) as Record<string, unknown>;
  const grade = (item.grade ?? null) as Record<string, unknown> | null;
  const fullName = String(profile.fullName ?? student.studentNumber ?? `Siswa ${index + 1}`);
  const initials = fullName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const tones = ["blue", "pink", "amber", "teal"] as const;
  const letter = grade && typeof grade.grade === "string" && grade.grade !== "" ? grade.grade : null;
  return {
    id: String(item.id ?? `sg-${index}`),
    studentName: fullName,
    studentNumber: String(student.studentNumber ?? "-"),
    initials: initials || "SW",
    avatarTone: tones[index % tones.length],
    tugas: parseScore(item.assignmentScore),
    uts: parseScore(item.midExamScore),
    uas: parseScore(item.finalExamScore),
    className: String(clazz.name ?? "Kelas"),
    subjectCode: String(subject.code ?? "MAT"),
    subjectName: String(subject.name ?? "Mata Pelajaran"),
    semester: String(academicYear.academic_year ?? "Semester"),
    gradeRange: grade
      ? {
          letter: letter ?? "-",
          minimumScore: parseScore(grade.minimumScore),
          maximumScore: parseScore(grade.maximumScore),
        }
      : null,
  };
}

/**
 * Susun body PATCH `/student-grades/:id` sesuai kontrak backend:
 * - hanya `number` 0-100 yang boleh terkirim;
 * - field bernilai `null` (kolom kosong) DI-OMIT — `UpdateStudentGradeSchema`
 *   memakai `z.number().optional()` sehingga `null` akan ditolak 400;
 * - semua field opsional, jadi PATCH bisa sebagian.
 */
export function buildUpdateGradePayload(input: UpdateGradeInput): Record<string, number> {
  const payload: Record<string, number> = {};
  if (input.assignmentScore != null) payload.assignmentScore = input.assignmentScore;
  if (input.midExamScore != null) payload.midExamScore = input.midExamScore;
  if (input.finalExamScore != null) payload.finalExamScore = input.finalExamScore;
  return payload;
}

export const getGradesApi = async (search?: string): Promise<GradeRow[]> => {
  const query = new URLSearchParams({
    page: "1",
    limit: "50",
    ...(search ? { search } : {}),
  });
  const response: ApiResponse<unknown> = await apiFetch(
    `/student-grades?${query.toString()}`,
  );
  const data = response.data;
  // Envelope backend: data berupa array item. Fallback `data.data` dipertahankan
  // untuk kompatibilitas dengan response yang membungkus array di dalam `data`.
  const rawArray: unknown = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)
      ? (data as { data: unknown[] }).data
      : [];
  return (rawArray as Record<string, unknown>[]).map(toGradeRow);
};

export const updateGradeApi = async (id: string, input: UpdateGradeInput): Promise<GradeRow> => {
  const payload = buildUpdateGradePayload(input);
  if (Object.keys(payload).length === 0) {
    throw new Error("Tidak ada perubahan nilai untuk disimpan.");
  }
  const response: ApiResponse<unknown> = await apiFetch(`/student-grades/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!response.data || typeof response.data !== "object") {
    throw new Error("Response pembaruan nilai tidak valid.");
  }
  return toGradeRow(response.data as Record<string, unknown>, 0);
};

export type { GradeListResponse };
