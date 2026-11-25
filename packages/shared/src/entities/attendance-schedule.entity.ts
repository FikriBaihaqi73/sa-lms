import type { Prisma } from "#generated/client";
import { attendanceScheduleSelect } from "#selects/attendance-schedule.select";

export type AttendanceScheduleEntity = Prisma.AttendanceSchedulesGetPayload<{
  select: typeof attendanceScheduleSelect;
}>;

export type AttendanceScheduleListEntity = AttendanceScheduleEntity[];
