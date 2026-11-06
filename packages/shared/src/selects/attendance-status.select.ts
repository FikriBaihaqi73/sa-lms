import type { Prisma } from "#generated/client";

export const attendanceStatusSelect = {
  id: true,
  institution_id: true,
  name: true,
  description: true,
  created_at: true,
  updated_at: true,
  attendances: {
    select: {
      id: true,
      attendance_date: true,
      attendance_status_id: true,
    },
  },
} satisfies Prisma.AttendanceStatusesSelect;

export type AttendanceStatusSelectType = typeof attendanceStatusSelect;

export type AttendanceStatusEntity = Prisma.AttendanceStatusesGetPayload<{
  select: AttendanceStatusSelectType;
}>;
