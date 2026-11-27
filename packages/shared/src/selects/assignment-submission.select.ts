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

  assignment: true,
  student: true,
  grader: {
    select: { id: true, email: true },
  },
} satisfies Prisma.AssignmentSubmissionSelect;

export type AssignmentSubmissionSelect = Prisma.AssignmentSubmissionGetPayload<{
  select: typeof assignmentSubmissionSelect;
}>;
