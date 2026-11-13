import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email().max(255).describe("Unique email address for login"),
  password: z
    .string()
    .min(8)
    .max(128)
    .describe("User password (8 to 128 characters)"),
  is_active: z
    .boolean()
    .optional()
    .default(true)
    .describe("User active status"),
});

export const UpdateUserSchema = CreateUserSchema.partial();

export const UserQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().describe("Page number"),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Items per page"),
  search: z
    .string()
    .optional()
    .describe("Search by email, name, role, or institution"),
  status: z
    .enum(["active", "deleted", "all"])
    .optional()
    .describe("User deletion status"),
  institution_id: z
    .string()
    .uuid()
    .optional()
    .describe("Institution filter for superadmin"),
});

export const UserStatsQuerySchema = z.object({
  institution_id: z
    .string()
    .uuid()
    .optional()
    .describe("Institution filter for superadmin"),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
export class UserQueryDto extends createZodDto(UserQuerySchema) {}
export class UserStatsQueryDto extends createZodDto(UserStatsQuerySchema) {}
