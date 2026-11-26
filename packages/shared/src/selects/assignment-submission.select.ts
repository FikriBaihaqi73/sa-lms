import type { Prisma } from "#generated/client";

export const assignmentSubmissionSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,

  assignmentId: true,
  studentId: true,
  submittedAt: true,
  score: true,
  feedback: true,
  status: true,
  gradedBy: true,
  gradedAt: true,

  assignment: {
    select: {
      id: true,
      title: true,
      due_date: true,
      max_score: true,
      module_id: true,
    },
  },
  student: {
    select: {
      id: true,
      studentNumber: true,
      profile: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  },
  grader: {
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
} satisfies Prisma.AssignmentSubmissionSelect;

export type AssignmentSubmissionSelect = Prisma.AssignmentSubmissionGetPayload<{
  select: typeof assignmentSubmissionSelect;
}>;
