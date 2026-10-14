import type { Prisma } from "#generated/client";

export const academicYearSelect = {
  id: true,
  academic_year: true,
  is_active: true,
  institution_id: true,
  created_at: true,
  updated_at: true,
} satisfies Prisma.AcademicYearsSelect;

export type AcademicYearSelectType = typeof academicYearSelect;

export type AcademicYearEntity = Prisma.AcademicYearsGetPayload<{
  select: AcademicYearSelectType;
}>;
