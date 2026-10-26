import type { Prisma } from "#generated/client";

export const classSelect = {
  id: true,
  institution_id: true,
  homeroom_teacher_id: true,
  academic_year_id: true,
  name: true,
  grade_level: true,
  capacity: true,
  created_at: true,
  updated_at: true,
  institution: {
    select: {
      id: true,
      name: true,
      shortName: true,
    },
  },
  homeroom_teacher: {
    select: {
      id: true,
      teacher_number: true,
      profile_id: true,
    },
  },
  academic_year: {
    select: {
      id: true,
      academic_year: true,
      is_active: true,
    },
  },
  _count: {
    select: {
      classStudents: {
        where: { deletedAt: null },
      },
    },
  },
} satisfies Prisma.ClassesSelect;

export type ClassSelectType = typeof classSelect;

export type ClassEntity = Prisma.ClassesGetPayload<{
  select: ClassSelectType;
}>;
