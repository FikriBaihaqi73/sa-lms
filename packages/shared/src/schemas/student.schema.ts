import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const CreateStudentSchema = z.object({
  profileId: z
    .string()
    .uuid("Invalid UUID format for profileId")
    .optional()
    .nullable()
    .describe("Optional Profile ID (UUID) associated with the student"),
  departmentId: z
    .string()
    .uuid("Invalid UUID format for departmentId")
    .optional()
    .describe("Department ID (UUID)"),
  academicStatusId: z
    .string()
    .uuid("Invalid UUID format for academicStatusId")
    .describe("Academic Status ID (UUID)"),
  studentNumber: z
    .string()
    .min(1, "Student number is required")
    .describe("Student Number/NIM"),
  enrollmentYear: z.number().int().optional().describe("Enrollment Year"),
  referralCode: z
    .string()
    .trim()
    .max(100, "Kode referral maksimal 100 karakter")
    .optional()
    .describe("Kode referral siswa"),
  referralExpiresAt: z
    .string()
    .datetime({ message: "Format tanggal expired harus ISO 8601" })
    .or(
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
    )
    .or(z.literal(""))
    .optional()
    .nullable()
    .describe("Tanggal kedaluwarsa kode referral"),
});

export const UpdateStudentSchema = CreateStudentSchema.partial();

export class CreateStudentDto extends createZodDto(CreateStudentSchema) {}
export class UpdateStudentDto extends createZodDto(UpdateStudentSchema) {}
