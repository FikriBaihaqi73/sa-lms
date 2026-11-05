import type { Prisma } from "#generated/client";

export const teachingJournalSelect = {
  id: true,
  schedule_id: true,
  meeting_number: true,
  journal_date: true,
  topic: true,
  material: true,
  notes: true,
  created_at: true,
  updated_at: true,
  created_by: true,
  updated_by: true,
  schedule: {
    select: {
      id: true,
      day: true,
      startTime: true,
      endTime: true,
      classroom: {
        select: {
          id: true,
          roomCode: true,
          roomName: true,
        },
      },
      classSubject: {
        select: {
          id: true,
          class: {
            select: {
              id: true,
              name: true,
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          teacher: {
            select: {
              id: true,
              teacher_number: true,
              profile: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
      },
    },
  },
  createdBy: {
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
} satisfies Prisma.TeachingJournalsSelect;

export type TeachingJournalEntity = Prisma.TeachingJournalsGetPayload<{
  select: typeof teachingJournalSelect;
}>;
