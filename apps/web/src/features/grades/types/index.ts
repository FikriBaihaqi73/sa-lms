export interface GradeRow {
  id: string;
  studentName: string;
  studentNumber: string;
  initials: string;
  avatarTone: "blue" | "pink" | "amber" | "teal";
  tugas: number | null;
  uts: number | null;
  uas: number | null;
  className: string;
  subjectCode: string;
  subjectName: string;
  semester: string;
}

export interface GradeFilters {
  className: string;
  subject: string;
  semester: string;
  search: string;
}

export interface UpdateGradeInput {
  assignmentScore?: number | null;
  midExamScore?: number | null;
  finalExamScore?: number | null;
}

export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
}

export interface GradeListResponse {
  data: GradeRow[];
  meta: {
    totalData: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}

export const GRADE_WEIGHTS = {
  tugas: 0.3,
  uts: 0.3,
  uas: 0.4,
} as const;

export const GRADE_KKM = 70;

export function calcFinalScore(row: Pick<GradeRow, "tugas" | "uts" | "uas">): number | null {
  if (row.tugas == null || row.uts == null || row.uas == null) return null;
  return Math.round((row.tugas * GRADE_WEIGHTS.tugas + row.uts * GRADE_WEIGHTS.uts + row.uas * GRADE_WEIGHTS.uas) * 10) / 10;
}

export function gradePredicate(finalScore: number | null): string {
  if (finalScore == null) return "Menunggu UAS";
  if (finalScore >= 90) return "Predikat A";
  if (finalScore >= 80) return "Predikat B";
  if (finalScore >= 70) return "Predikat C";
  return `Predikat D (< KKM)`;
}

export type GradeStatus = "Lulus" | "Remedial" | "Belum lengkap";

export function gradeStatus(finalScore: number | null): GradeStatus {
  if (finalScore == null) return "Belum lengkap";
  return finalScore >= GRADE_KKM ? "Lulus" : "Remedial";
}
