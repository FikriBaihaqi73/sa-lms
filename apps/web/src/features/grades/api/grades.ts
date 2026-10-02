import { apiFetch } from "@/lib/api";
import type { ApiResponse, GradeListResponse, GradeRow, UpdateGradeInput } from "../types";

const MOCK_GRADES: GradeRow[] = [
  {
    id: "sg-1",
    studentName: "Ahmad Rizki",
    studentNumber: "240101",
    initials: "AR",
    avatarTone: "blue",
    tugas: 88,
    uts: 88,
    uas: 92,
    className: "Kelas 7A",
    subjectCode: "MTK",
    subjectName: "Matematika",
    semester: "Semester Ganjil",
  },
  {
    id: "sg-2",
    studentName: "Siti Nurhaliza",
    studentNumber: "240102",
    initials: "SN",
    avatarTone: "pink",
    tugas: 95,
    uts: 98,
    uas: 88,
    className: "Kelas 7A",
    subjectCode: "MTK",
    subjectName: "Matematika",
    semester: "Semester Ganjil",
  },
  {
    id: "sg-3",
    studentName: "Budi Prasetyo",
    studentNumber: "240103",
    initials: "BP",
    avatarTone: "amber",
    tugas: 60,
    uts: 55,
    uas: 58,
    className: "Kelas 7A",
    subjectCode: "MTK",
    subjectName: "Matematika",
    semester: "Semester Ganjil",
  },
  {
    id: "sg-4",
    studentName: "Dewi Pratiwi",
    studentNumber: "240104",
    initials: "DP",
    avatarTone: "teal",
    tugas: 78,
    uts: 82,
    uas: null,
    className: "Kelas 7A",
    subjectCode: "MTK",
    subjectName: "Matematika",
    semester: "Semester Ganjil",
  },
];

const LOCAL_KEY = "mock_grades_data";

function getMockStorage(): GradeRow[] {
  if (typeof window === "undefined") return MOCK_GRADES;
  const stored = localStorage.getItem(LOCAL_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(MOCK_GRADES));
    return MOCK_GRADES;
  }
  try {
    return JSON.parse(stored) as GradeRow[];
  } catch {
    return MOCK_GRADES;
  }
}

function setMockStorage(items: GradeRow[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  }
}

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
    className: String(clazz.name ?? "Kelas 7A"),
    subjectCode: String(subject.code ?? "MTK"),
    subjectName: String(subject.name ?? "Matematika"),
    semester: String(academicYear.academic_year ?? "Semester Ganjil"),
  };
}

export const getGradesApi = async (search?: string): Promise<GradeRow[]> => {
  try {
    const query = new URLSearchParams({
      page: "1",
      limit: "50",
      ...(search ? { search } : {}),
    });
    const response: ApiResponse<GradeRow[]> | { data: unknown[] } = await apiFetch(
      `/student-grades?${query.toString()}`,
    );
    const data = (response as ApiResponse<unknown[]>).data;
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
      return (data as Record<string, unknown>[]).map(toGradeRow);
    }
    return getMockStorage();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Backend server offline, menggunakan data preview halaman nilai.");
      return getMockStorage();
    }
    throw error;
  }
};

export const updateGradeApi = async (id: string, input: UpdateGradeInput): Promise<GradeRow> => {
  try {
    const response: ApiResponse<Record<string, unknown>> = await apiFetch(`/student-grades/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...(input.assignmentScore !== undefined ? { assignmentScore: input.assignmentScore } : {}),
        ...(input.midExamScore !== undefined ? { midExamScore: input.midExamScore } : {}),
        ...(input.finalExamScore !== undefined ? { finalExamScore: input.finalExamScore } : {}),
      }),
    });
    return toGradeRow(response.data, 0);
  } catch (error) {
    if (import.meta.env.DEV) {
      const items = getMockStorage();
      let updated: GradeRow | null = null;
      const next = items.map((item) => {
        if (item.id !== id) return item;
        updated = {
          ...item,
          tugas: input.assignmentScore !== undefined ? input.assignmentScore : item.tugas,
          uts: input.midExamScore !== undefined ? input.midExamScore : item.uts,
          uas: input.finalExamScore !== undefined ? input.finalExamScore : item.uas,
        };
        return updated;
      });
      setMockStorage(next);
      if (updated) return updated;
    }
    throw error;
  }
};

export type { GradeListResponse };
