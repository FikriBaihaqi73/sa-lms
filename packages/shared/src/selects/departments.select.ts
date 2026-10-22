import type { Prisma } from "#generated/client";

export const departmentSelect = {
  id: true,
  name: true,
  code: true,
  institution_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  teachers: {
    where: {
      deleted_at: null,
    },
    select: {
      id: true,
      teacher_number: true,
      profile: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          photoUrl: true,
        },
      },
    },
  },
  _count: {
    select: {
      teachers: {
        where: {
          deleted_at: null,
        },
      },
      subjects: true,
    },
  },
} satisfies Prisma.DepartmentsSelect;

export type DepartmentSelectType = typeof departmentSelect;

export type DepartmentEntity = Prisma.DepartmentsGetPayload<{
  select: DepartmentSelectType;
}>;
