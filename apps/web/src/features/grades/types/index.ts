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
  /**
   * Rentang nilai huruf (Grade Range) dari relasi `grade` pada response
   * `GET/PATCH /student-grades`. Backend mengirim `minimumScore`/`maximumScore`
   * sebagai Decimal (ter-serialize jadi string JSON), sudah dinormalkan ke number.
   */
  gradeRange: {
    letter: string;
    minimumScore: number | null;
    maximumScore: number | null;
  } | null;
}

export interface GradeFilters {
  className: string;
  subject: string;
  semester: string;
  search: string;
}

/**
 * Input PATCH `/student-grades/:id`.
 * Backend (CreateStudentGradeSchema.partial) menerima `number` 0-100 dan hanya
 * mengabaikan field yang tidak dikirim (undefined) — `null` DITOLAK oleh Zod.
 * Nilai `null` di sini berarti "kolom kosong di form"; lapisan API mengubahnya
 * menjadi field yang tidak ikut dikirim (di-omit).
 */
export interface UpdateGradeInput {
  assignmentScore?: number | null;
  midExamScore?: number | null;
  finalExamScore?: number | null;
}

/**
 * Envelope response backend (lihat packages/shared/src/http/response.ts):
 * `{ status, message, data, code, meta? }` dengan `data` yang bisa null.
 */
export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T | null;
  meta?: {
    totalData: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
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

/**
 * Normalisasi nilai skor dari backend menjadi `number | null`.
 *
 * Kolom skor bertipe Decimal (Prisma/decimal.js). `JSON.stringify` memanggil
 * `Decimal.prototype.toJSON` yang mengembalikan string (bukti:
 * `node_modules/.pnpm/decimal.js@10.6.0/node_modules/decimal.js/decimal.js`
 * baris 2461 dan `@prisma/client-runtime-utils/dist/index.js` baris 1221:
 * `P.valueOf = P.toJSON = function() { ... return str; }`), sehingga nilai di
 * wire format berupa string seperti `"85"` atau `"85.50"` — bukan number.
 * Fungsi ini menerima number, string numerik, objek Decimal mentah, null, atau
 * undefined, dan mengembalikan number yang finite, atau null jika tidak valid.
 */
export function parseScore(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof value === "object") {
    // Objek Decimal yang belum ter-serialize punya toString numerik.
    const parsed = Number(String(value));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function calcFinalScore(row: Pick<GradeRow, "tugas" | "uts" | "uas">): number | null {
  const tugas = parseScore(row.tugas);
  const uts = parseScore(row.uts);
  const uas = parseScore(row.uas);
  if (tugas == null || uts == null || uas == null) return null;
  return Math.round((tugas * GRADE_WEIGHTS.tugas + uts * GRADE_WEIGHTS.uts + uas * GRADE_WEIGHTS.uas) * 10) / 10;
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
