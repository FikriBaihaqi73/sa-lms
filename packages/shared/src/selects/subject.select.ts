import type { Prisma } from "#generated/client";

export const subjectSelect = {
  id: true,
  code: true,
  name: true,
  credits: true,
  description: true,
  institutionId: true,
  departmentId: true,
  createdAt: true,
  updatedAt: true,
  institution: {
    select: {
      id: true,
      name: true,
    },
  },
  department: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
} satisfies Prisma.SubjectSelect;

export type SubjectSelectType = typeof subjectSelect;
