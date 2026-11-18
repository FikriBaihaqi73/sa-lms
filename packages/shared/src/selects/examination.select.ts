import type { Prisma } from "#generated/client";

export const examinationSelect = {
  id: true,
  classSubjectId: true,
  assignmentTypeId: true,
  title: true,
  description: true,
  examinationDate: true,
  duration: true,
  maximumScore: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  deletedAt: true,
  classSubject: {
    select: {
      id: true,
      class: { select: { id: true, name: true, institution_id: true } },
      subject: { select: { id: true, name: true } },
      academic_year: { select: { id: true, academic_year: true } },
    },
  },
  assignmentType: {
    select: {
      id: true,
      name: true,
    },
  },
  creator: {
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  },
  updater: {
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  },
} satisfies Prisma.ExaminationsSelect;

export type ExaminationEntity = Prisma.ExaminationsGetPayload<{
  select: typeof examinationSelect;
}>;
