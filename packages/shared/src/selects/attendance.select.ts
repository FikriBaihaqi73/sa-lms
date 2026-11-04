import type { Prisma } from "#generated/client";

export const attendanceSelect = {
  id: true,
  schedule_id: true,
  student_id: true,
  attendance_status_id: true,
  attendance_date: true,
  notes: true,
  created_at: true,
  updated_at: true,
  attendance_status: {
    select: {
      id: true,
      name: true,
      description: true,
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
              grade_level: true,
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
} satisfies Prisma.AttendancesSelect;

export type AttendanceSelectType = typeof attendanceSelect;

export type AttendanceEntity = Prisma.AttendancesGetPayload<{
  select: AttendanceSelectType;
}>;
