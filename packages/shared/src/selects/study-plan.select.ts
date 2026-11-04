import type { Prisma } from "#generated/client";
import { academicYearSelect } from "./academic-year.select.js";
import { classSubjectsSelect } from "./class-subjects.select.js";
import { studentSelect } from "./students.select.js";

export const studyPlanSelect = {
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  student_id: true,
  class_subject_id: true,
  academic_year_id: true,
  student: {
    select: studentSelect,
  },
  classSubject: {
    select: classSubjectsSelect,
  },
  academicYear: {
    select: academicYearSelect,
  },
} satisfies Prisma.StudyPlansSelect;

export type StudyPlanEntity = Prisma.StudyPlansGetPayload<{
  select: typeof studyPlanSelect;
}>;
