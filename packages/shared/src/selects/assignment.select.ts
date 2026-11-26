import type { Prisma } from "#generated/client";
import { assignmentTypeSelect } from "./assignment-type.select.js";

export const assignmentSelect = {
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  assignment_type_id: true,
  module_id: true,
  title: true,
  description: true,
  due_date: true,
  max_score: true,
  module: {
    select: {
      id: true,
      title: true,
      class_subject: {
        select: {
          id: true,
          created_at: true,
          updated_at: true,
          deleted_at: true,
          class_id: true,
          subject_id: true,
          teacher_id: true,
          academic_year_id: true,
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
          academic_year: {
            select: {
              id: true,
              academic_year: true,
              is_active: true,
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
  assignment_type: {
    select: assignmentTypeSelect,
  },
} satisfies Prisma.AssignmentsSelect;

export type AssignmentSelectType = typeof assignmentSelect;

export type AssignmentEntity = Prisma.AssignmentsGetPayload<{
  select: AssignmentSelectType;
}>;
