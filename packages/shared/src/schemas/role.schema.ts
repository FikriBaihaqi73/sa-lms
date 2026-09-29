import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const CreateRoleSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(255, "Role name must not exceed 255 characters")
    .describe("Name of the role (e.g., Admin, Teacher, Student)"),
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional()
    .nullable()
    .describe("Optional description of the role"),
  permissionIds: z
    .array(z.string().uuid())
    .optional()
    .default([])
    .describe("List of permission UUIDs to assign to this role"),
});

export const UpdateRoleSchema = z.object({
  name: z
    .string()
    .min(1, "Role name must not be empty")
    .max(255, "Role name must not exceed 255 characters")
    .optional()
    .describe("Updated name of the role"),
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional()
    .nullable()
    .describe("Updated description of the role"),
  permissionIds: z
    .array(z.string().uuid())
    .optional()
    .describe("Updated list of permission UUIDs for this role"),
});

export class CreateRoleDto extends createZodDto(CreateRoleSchema) {}
export class UpdateRoleDto extends createZodDto(UpdateRoleSchema) {}
