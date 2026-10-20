/**
 * Standard Grading (Skala / Rubrik Penilaian) Domain Types.
 * Mewakili model `Grades` pada backend dan Prisma schema.
 */

export interface StandardGrade {
  id: string;
  grade: string;
  minimumScore: number | null;
  maximumScore: number | null;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGradeInput {
  grade: string;
  minimumScore?: number | null;
  maximumScore?: number | null;
  description?: string | null;
}

export interface UpdateGradeInput {
  grade?: string;
  minimumScore?: number | null;
  maximumScore?: number | null;
  description?: string | null;
}

export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T | null;
}

/**
 * Normalisasi skor Decimal dari backend menjadi number | null.
 * Menangani string numerik, instance Decimal serialized, number, null, atau undefined.
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
    const parsed = Number(String(value));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Format rentang skor menjadi teks yang mudah dipahami.
 */
export function formatScoreRange(
  minimumScore: number | null,
  maximumScore: number | null,
): string {
  if (minimumScore != null && maximumScore != null) {
    return `${minimumScore.toFixed(2).replace(/\.00$/, "")} – ${maximumScore.toFixed(2).replace(/\.00$/, "")}`;
  }
  if (minimumScore != null) {
    return `≥ ${minimumScore.toFixed(2).replace(/\.00$/, "")}`;
  }
  if (maximumScore != null) {
    return `≤ ${maximumScore.toFixed(2).replace(/\.00$/, "")}`;
  }
  return "Tanpa batasan skor";
}

export interface GradeBadgeTheme {
  bg: string;
  text: string;
  border: string;
  dot: string;
  glow: string;
}

/**
 * Tema warna badge predikat nilai secara dinamis sesuai huruf mutu.
 */
export function getGradeColorBadge(grade: string): GradeBadgeTheme {
  const normalized = grade.trim().toUpperCase();

  if (normalized.startsWith("A")) {
    return {
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
      dot: "bg-emerald-500",
      glow: "shadow-emerald-500/10",
    };
  }

  if (normalized.startsWith("B")) {
    return {
      bg: "bg-blue-50 dark:bg-blue-950/40",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
      dot: "bg-blue-500",
      glow: "shadow-blue-500/10",
    };
  }

  if (normalized.startsWith("C")) {
    return {
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
      dot: "bg-amber-500",
      glow: "shadow-amber-500/10",
    };
  }

  if (normalized.startsWith("D")) {
    return {
      bg: "bg-orange-50 dark:bg-orange-950/40",
      text: "text-orange-700 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-800",
      dot: "bg-orange-500",
      glow: "shadow-orange-500/10",
    };
  }

  if (normalized.startsWith("E") || normalized.startsWith("F")) {
    return {
      bg: "bg-rose-50 dark:bg-rose-950/40",
      text: "text-rose-700 dark:text-rose-400",
      border: "border-rose-200 dark:border-rose-800",
      dot: "bg-rose-500",
      glow: "shadow-rose-500/10",
    };
  }

  return {
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
    dot: "bg-slate-400",
    glow: "shadow-slate-500/10",
  };
}
