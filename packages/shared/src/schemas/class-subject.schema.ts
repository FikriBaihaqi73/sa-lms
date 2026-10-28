import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const CreateClassSubjectSchema = z.object({
  class_id: z.uuid().describe("Class ID"),
  subject_id: z.uuid().describe("Subject ID"),
  teacher_id: z.uuid().describe("Teacher ID"),
  academic_year_id: z.uuid().describe("Academic year ID"),
});

export const UpdateClassSubjectSchema = z.object({
  class_id: z.uuid().optional().describe("Class ID"),
  subject_id: z.uuid().optional().describe("Subject ID"),
  teacher_id: z.uuid().optional().describe("Teacher ID"),
  academic_year_id: z.uuid().optional().describe("Academic year ID"),
});

export class CreateClassSubjectDto extends createZodDto(
  CreateClassSubjectSchema,
) {}

export class UpdateClassSubjectDto extends createZodDto(
  UpdateClassSubjectSchema,
) {}

export const ClassSubjectQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).describe("Page number"),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .describe("Number of items per page"),
  search: z.string().optional().describe("Search class subject records"),
  class_id: z.uuid().optional().describe("Class ID filter"),
  academic_year_id: z.uuid().optional().describe("Academic year ID filter"),
  teacher_id: z.uuid().optional().describe("Teacher ID filter"),
});

export class ClassSubjectQueryDto extends createZodDto(
  ClassSubjectQuerySchema,
) {}
