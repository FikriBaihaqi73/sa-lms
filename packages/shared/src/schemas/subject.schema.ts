import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const CreateSubjectSchema = z.object({
  code: z
    .string()
    .min(1, "Subject code is required")
    .max(100, "Subject code must not exceed 100 characters")
    .describe("Unique subject code"),
  name: z
    .string()
    .min(1, "Subject name is required")
    .max(255, "Subject name must not exceed 255 characters")
    .describe("Subject name"),
  credits: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe("Number of credits for the subject"),
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional()
    .describe("Subject description"),
  institutionId: z.uuid().describe("Institution ID"),
  departmentId: z.uuid().optional().describe("Department ID"),
});

export const UpdateSubjectSchema = CreateSubjectSchema.partial().extend({
  departmentId: z
    .uuid()
    .nullable()
    .optional()
    .describe("Department ID; null clears the department assignment"),
});

export class CreateSubjectDto extends createZodDto(CreateSubjectSchema) {}
export class UpdateSubjectDto extends createZodDto(UpdateSubjectSchema) {}

export const SubjectQuerySchema = z.object({
  page: z.coerce
    .number()
    .min(1)
    .default(1)
    .describe("Page number for pagination"),
  limit: z.coerce
    .number()
    .min(1)
    .default(10)
    .describe("Number of items per page"),
  search: z
    .string()
    .optional()
    .describe("Search keyword for subject code or name"),
  institutionId: z
    .string()
    .uuid()
    .optional()
    .describe("Filter by institution ID"),
  departmentId: z
    .string()
    .uuid()
    .optional()
    .describe("Filter by department ID"),
});

export class SubjectQueryDto extends createZodDto(SubjectQuerySchema) {}
