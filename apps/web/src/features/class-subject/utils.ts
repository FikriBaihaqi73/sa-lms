import type { ClassSubject, ClassSubjectFilters } from "./types";

export interface AcademicYearOption {
  id: string;
  academic_year: string;
  is_active: boolean;
  institution_id: string | null;
}

export function classSubjectsQueryKey(params: ClassSubjectFilters) {
  return ["class-subjects", params] as const;
}

export function classSubjectFormDefaults(item?: ClassSubject | null) {
  return {
    class_id: item?.class_id ?? "",
    subject_id: item?.subject_id ?? "",
    teacher_id: item?.teacher_id ?? "",
    academic_year_id: item?.academic_year_id ?? "",
  };
}

export type AcademicYearFilter = "default" | "all" | string;

export function filterAcademicYears(
  years: AcademicYearOption[],
  institutionId?: string,
) {
  if (!institutionId) return [];
  return years.filter((year) => year.institution_id === institutionId);
}

export function academicYearQueryId(filter: AcademicYearFilter, activeId?: string) {
  return filter === "default" ? activeId ?? "" : filter === "all" ? "" : filter;
}

export function pageAfterDelete(page: number, remainingItems: number) {
  return page > 1 && remainingItems === 0 ? page - 1 : page;
}

export function classSubjectFieldError(status: number, fieldErrors: { field: string; message: string }[]) {
  if (status === 409) return { field: "academic_year_id", message: "Mata pelajaran ini sudah terdaftar di kelas dan tahun ajaran tersebut." };
  return status === 422 ? fieldErrors[0] ?? null : null;
}

export function classSubjectDeleteError(status: number) {
  return status === 409 ? "Mata pelajaran kelas tidak dapat dihapus karena masih digunakan oleh jadwal, modul, ujian, atau nilai." : null;
}
