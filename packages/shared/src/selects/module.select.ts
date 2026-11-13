import type { Prisma } from "#generated/client";
import { classSubjectsSelect } from "./class-subjects.select";

export const moduleSelect = {
  id: true,
  created_by: true,
  updated_by: true,
  created_at: true,
  updated_at: true,
  class_subject_id: true,
  title: true,
  description: true,
  display_order: true,
  is_published: true,
  is_locked: true,
  moduleContents: true,
  assignments: true,
  class_subject: {
    select: classSubjectsSelect,
  },
} satisfies Prisma.ModulesSelect;

export type ModuleSelectType = typeof moduleSelect;

export type ModuleEntity = Prisma.ModulesGetPayload<{
  select: ModuleSelectType;
}>;
