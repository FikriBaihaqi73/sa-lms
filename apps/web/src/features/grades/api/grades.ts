import { apiFetch } from "@/lib/api";
import type { ApiResponse, GradeListResponse, GradeRow, UpdateGradeInput } from "../types";

function toGradeRow(item: Record<string, unknown>, index: number): GradeRow {
  const student = (item.student ?? {}) as Record<string, unknown>;
  const profile = (student.profile ?? {}) as Record<string, unknown>;
  const classSubject = (item.classSubject ?? {}) as Record<string, unknown>;
  const clazz = (classSubject.class ?? {}) as Record<string, unknown>;
  const subject = (classSubject.subject ?? {}) as Record<string, unknown>;
  const academicYear = (item.academicYear ?? {}) as Record<string, unknown>;
  const fullName = String(profile.fullName ?? student.studentNumber ?? `Siswa ${index + 1}`);
  const initials = fullName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const tones = ["blue", "pink", "amber", "teal"] as const;
  return {
    id: String(item.id ?? `sg-${index}`),
    studentName: fullName,
    studentNumber: String(student.studentNumber ?? "-"),
    initials: initials || "SW",
    avatarTone: tones[index % tones.length],
    tugas: (item.assignmentScore as number | null) ?? null,
    uts: (item.midExamScore as number | null) ?? null,
    uas: (item.finalExamScore as number | null) ?? null,
    className: String(clazz.name ?? "Kelas"),
    subjectCode: String(subject.code ?? "MAT"),
    subjectName: String(subject.name ?? "Mata Pelajaran"),
    semester: String(academicYear.academic_year ?? "Semester"),
  };
}

export const getGradesApi = async (search?: string): Promise<GradeRow[]> => {
  const query = new URLSearchParams({
    page: "1",
    limit: "50",
    ...(search ? { search } : {}),
  });
  const response: ApiResponse<GradeRow[]> | { data: unknown[] } = await apiFetch(
    `/student-grades?${query.toString()}`,
  );
  const data = (response as ApiResponse<unknown[]>).data;
  const rawArray = Array.isArray(data) ? data : ((data as any)?.data || []);
  return (rawArray as Record<string, unknown>[]).map(toGradeRow);
};

export const updateGradeApi = async (id: string, input: UpdateGradeInput): Promise<GradeRow> => {
  const response: ApiResponse<Record<string, unknown>> = await apiFetch(`/student-grades/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...(input.assignmentScore !== undefined ? { assignmentScore: input.assignmentScore } : {}),
      ...(input.midExamScore !== undefined ? { midExamScore: input.midExamScore } : {}),
      ...(input.finalExamScore !== undefined ? { finalExamScore: input.finalExamScore } : {}),
    }),
  });
  return toGradeRow(response.data, 0);
};

export type { GradeListResponse };
