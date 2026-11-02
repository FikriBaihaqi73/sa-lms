import type { Prisma } from "#generated/client";
import { classSubjectsSelect } from "./class-subjects.select.js";
import { classroomSelect } from "./classroom.select.js";

export const scheduleSelect = {
  id: true,
  classSubjectId: true,
  classroomId: true,
  day: true,
  startTime: true,
  endTime: true,
  classroom: {
    select: classroomSelect,
  },
  classSubject: {
    select: classSubjectsSelect,
  },
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.ScheduleSelect;

export type ScheduleSelectType = typeof scheduleSelect;

export type ScheduleEntity = Prisma.ScheduleGetPayload<{
  select: ScheduleSelectType;
}>;
