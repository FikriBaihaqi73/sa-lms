import type { Prisma } from "#generated/client";

export const attendanceScheduleSelect = {
  id: true,
  academicYearId: true,
  classId: true,
  scheduleId: true,
  title: true,
  scheduleType: true,
  activeDays: true,
  specificDate: true,
  startTime: true,
  endTime: true,
  isActive: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  academicYear: {
    select: {
      id: true,
      academic_year: true,
      is_active: true,
      institution_id: true,
    },
  },
  class: {
    select: {
      id: true,
      name: true,
      grade_level: true,
      institution_id: true,
      academic_year_id: true,
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
          roomName: true,
          roomCode: true,
        },
      },
      classSubject: {
        select: {
          id: true,
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
} satisfies Prisma.AttendanceSchedulesSelect;

export type AttendanceScheduleSelectType = typeof attendanceScheduleSelect;

export type AttendanceScheduleEntity = Prisma.AttendanceSchedulesGetPayload<{
  select: AttendanceScheduleSelectType;
}>;
