import type { Teacher } from "../types";

export interface TeachersTableProps {
  teachers: Teacher[];
  isLoading: boolean;
  isError: boolean;
  page: number;
  limit: number;
  total: number;
  onAdd: () => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}

export function teacherDisplayName(teacher: Teacher): string {
  return teacher.profile?.fullName?.trim() || "Nama belum tersedia";
}

export function teacherEmail(teacher: Teacher): string | null {
  return teacher.profile?.email?.trim() || null;
}

export function teacherClassCount(teacher: Teacher): number {
  return teacher._count?.classSubjects ?? 0;
}

export function teacherHasAccount(teacher: Teacher): boolean {
  return Boolean(teacher.profile?.userId);
}

