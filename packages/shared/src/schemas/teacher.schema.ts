import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const CreateTeacherSchema = z.object({
  profile_id: z
    .string()
    .uuid("Invalid UUID format for profile_id")
    .optional()
    .nullable()
    .describe("Optional Profile ID (UUID) associated with the teacher"),
  department_id: z
    .string()
    .uuid("Invalid UUID format for department_id")
    .optional()
    .nullable()
    .describe("Optional Department ID (UUID) the teacher belongs to"),
  specialization_id: z
    .string()
    .uuid("Invalid UUID format for specialization_id")
    .optional()
    .nullable()
    .describe("Optional Specialization ID (UUID) of the teacher"),
  employment_status_id: z
    .string()
    .uuid("Invalid UUID format for employment_status_id")
    .optional()
    .nullable()
    .describe("Optional Employment Status ID (UUID) of the teacher"),
  teacher_number: z
    .string()
    .min(1, "Teacher number is required")
    .max(100, "Teacher number must not exceed 100 characters")
    .describe("Unique identification/registration number for the teacher"),
  join_date: z
    .string()
    .refine(
      (val) => !Number.isNaN(Date.parse(val)),
      "Teacher join date must be a valid date format (YYYY-MM-DD or ISO 8601)",
    )
    .optional()
    .nullable()
    .describe("Teacher join date (YYYY-MM-DD or ISO 8601 format)"),
});

export const UpdateTeacherSchema = CreateTeacherSchema.partial();

export class CreateTeacherDto extends createZodDto(CreateTeacherSchema) {}
export class UpdateTeacherDto extends createZodDto(UpdateTeacherSchema) {}
