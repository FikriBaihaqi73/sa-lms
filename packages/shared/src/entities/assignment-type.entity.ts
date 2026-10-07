import type { Prisma } from "#generated/client";
import { assignmentTypeSelect } from "#selects/assignment-type.select";

// Tipe balikan untuk satu objek Assignment Type
export type AssignmentTypeEntity = Prisma.AssignmentTypesGetPayload<{
  select: typeof assignmentTypeSelect;
}>;

// Tipe balikan jika datanya berupa Array (untuk list)
export type AssignmentTypeListEntity = AssignmentTypeEntity[];
