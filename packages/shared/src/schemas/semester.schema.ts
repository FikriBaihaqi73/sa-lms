import { createZodDto } from "nestjs-zod/dto";

import { z } from "zod";

export const CreateSemesterSchema = z.object({
  academic_year_id: z.string().uuid().describe("Academic year ID"),

  name: z.string().min(1).describe("Semester name"),

  start_date: z
    .string()
    .datetime({ message: "Invalid date format" })
    .optional()
    .describe("Semester start date (ISO 8601)"),

  end_date: z
    .string()
    .datetime({ message: "Invalid date format" })
    .optional()
    .describe("Semester end date (ISO 8601)"),

  is_active: z.boolean().optional().describe("Semester active status"),
});

export const UpdateSemesterSchema = CreateSemesterSchema.partial();

export const FindAllSemesterSchema = z.object({
  page: z.coerce.number().int().min(1).optional().describe("Page number"),
  limit: z.coerce.number().int().min(1).optional().describe("Items per page"),
  search: z.string().optional().describe("Search keyword"),
  academic_year_id: z
    .string()
    .uuid()
    .optional()
    .describe("Filter by academic year ID"),
});

export class CreateSemesterDto extends createZodDto(CreateSemesterSchema) {}

export class UpdateSemesterDto extends createZodDto(UpdateSemesterSchema) {}

export class FindAllSemesterDto extends createZodDto(FindAllSemesterSchema) {}
