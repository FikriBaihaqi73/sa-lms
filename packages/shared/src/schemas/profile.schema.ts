import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const CreateProfileSchema = z.object({
  userId: z.string().uuid().describe("User ID"),
  roleId: z.string().uuid().describe("Role ID"),
  institutionId: z.string().uuid().describe("Institution ID"),
  fullName: z.string().min(1).max(255).describe("Full name of the profile"),
  identityNumber: z.string().max(255).optional().describe("Identity number"),
  gender: z.string().max(50).optional().describe("Gender"),
  birthPlace: z.string().max(255).optional().describe("Birth place"),
  birthDate: z
    .string()
    .refine(
      (val) => !Number.isNaN(Date.parse(val)),
      "Birth date must be a valid date format (YYYY-MM-DD or ISO 8601)",
    )
    .optional()
    .describe("Birth date (YYYY-MM-DD or ISO 8601)"),
  religionId: z.string().uuid().optional().describe("Religion ID"),
  nationalityId: z.string().uuid().optional().describe("Nationality ID"),
  address: z.string().optional().describe("Address"),
  phoneNumber: z.string().max(255).optional().describe("Phone number"),
  email: z.string().email().max(255).optional().describe("Email address"),
  photoUrl: z.string().url().optional().describe("Photo URL"),
});

export const UpdateProfileSchema = CreateProfileSchema.partial();

export class CreateProfileDto extends createZodDto(CreateProfileSchema) {}
export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}
