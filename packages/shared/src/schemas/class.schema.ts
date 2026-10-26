import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const GRADE_LEVEL_ERROR =
  "Tingkatan kelas minimal 1 dan harus berupa bilangan bulat.";
export const CreateClassSchema = z.object({
  homeroom_teacher_id: z.uuid().optional().describe("Homeroom teacher ID"),
  academic_year_id: z.uuid().describe("Academic year ID"),
  name: z.string().min(1).describe("Class name"),
  grade_level: z
    .number()
    .int(GRADE_LEVEL_ERROR)
    .min(1, GRADE_LEVEL_ERROR)
    .describe("Grade level"),
});

export const UpdateClassSchema = z.object({
  homeroom_teacher_id: z
    .uuid()
    .nullable()
    .optional()
    .describe("Homeroom teacher ID"),
  academic_year_id: z.uuid().optional().describe("Academic year ID"),
  name: z.string().min(1).optional().describe("Class name"),
  grade_level: z
    .number()
    .int(GRADE_LEVEL_ERROR)
    .min(1, GRADE_LEVEL_ERROR)
    .optional()
    .describe("Grade level"),
});

export const ClassQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().describe("Page number"),
  limit: z.coerce.number().int().min(1).optional().describe("Items per page"),
  search: z.string().trim().optional().describe("Search keyword"),
});

export class CreateClassDto extends createZodDto(CreateClassSchema) {}

export class UpdateClassDto extends createZodDto(UpdateClassSchema) {}

export class ClassQueryDto extends createZodDto(ClassQuerySchema) {}
