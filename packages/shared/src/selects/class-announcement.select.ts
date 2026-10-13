import type { Prisma } from "#generated/client";
import { classSelect } from "./class.select.js";

export const classAnnouncementSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,

  classId: true,
  title: true,
  content: true,
  class: {
    select: classSelect,
  },
} satisfies Prisma.ClassAnnouncementSelect;

export type ClassAnnouncementSelectType = typeof classAnnouncementSelect;

export type ClassAnnouncementEntity = Prisma.ClassAnnouncementGetPayload<{
  select: ClassAnnouncementSelectType;
}>;
