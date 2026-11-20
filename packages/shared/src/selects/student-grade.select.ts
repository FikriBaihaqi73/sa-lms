import type { Prisma } from "#generated/client";
import { gradeSelect } from "#selects/grades.select";

const studentGradeStudentSelect = {
  id: true,
  studentNumber: true,
  profile: {
    select: {
      fullName: true,
    },
  },
} satisfies Prisma.StudentSelect;

export const studentGradeSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,

  studentId: true,
  classSubjectId: true,
  academicYearId: true,
  assignmentScore: true,
  quizScore: true,
  midExamScore: true,
  finalExamScore: true,
  finalScore: true,
  gradeId: true,
  remarks: true,

  student: {
    select: studentGradeStudentSelect,
  },
  classSubject: {
    select: {
      id: true,
      class: {
        select: { id: true, name: true },
      },
      subject: {
        select: { id: true, name: true },
      },
      academic_year: {
        select: { id: true, academic_year: true },
      },
    },
  },
  academicYear: {
    select: {
      id: true,
      academic_year: true,
    },
  },
  grade: {
    select: gradeSelect,
  },
} satisfies Prisma.StudentGradesSelect;

export type StudentGradeSelectType = typeof studentGradeSelect;

export type StudentGradeEntity = Prisma.StudentGradesGetPayload<{
  select: StudentGradeSelectType;
}>;
