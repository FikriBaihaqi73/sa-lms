import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

const GuardianFieldsSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .describe("Full name of the guardian"),
  relationship: z
    .string()
    .optional()
    .describe("Relationship to the student (e.g., Father, Mother)"),
  phoneNumber: z.string().optional().describe("Phone number of the guardian"),
  email: z
    .string()
    .email("Invalid email format")
    .optional()
    .describe("Email address of the guardian"),
  address: z.string().optional().describe("Home address of the guardian"),
  occupation: z.string().optional().describe("Occupation of the guardian"),
});

export const CreateGuardianSchema = GuardianFieldsSchema.extend({
  studentId: z
    .string()
    .min(1, "Student selection is required")
    .uuid("Student ID must be a valid UUID")
    .describe("ID of the student linked to the guardian"),
});

export const UpdateGuardianSchema = GuardianFieldsSchema.partial();

export class CreateGuardianDto extends createZodDto(CreateGuardianSchema) {}
export class UpdateGuardianDto extends createZodDto(UpdateGuardianSchema) {}
