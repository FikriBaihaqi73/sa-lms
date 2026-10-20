import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const RegisterSchema = z
  .object({
    role: z
      .enum(["student", "instansi"])
      .describe("Role to register as (public self-registration only)"),
    email: z
      .email("Email format is invalid")
      .max(255, "Email must not exceed 255 characters")
      .describe("Unique email address used for the account"),
    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(128, "Password must not exceed 128 characters")
      .describe("Password between 8 and 128 characters"),
    institutionName: z
      .string()
      .min(3, "Institution name must be at least 3 characters")
      .max(255, "Institution name must not exceed 255 characters")
      .optional()
      .describe(
        "Name of the institution to be created (required if role is instansi)",
      ),
    referralCode: z
      .string()
      .trim()
      .min(3, "Kode referral minimal 3 karakter")
      .max(100, "Kode referral maksimal 100 karakter")
      .optional()
      .describe(
        "Active referral code from the institution (required if role is student)",
      ),
  })
  .superRefine((data, ctx) => {
    if (data.role === "instansi" && !data.institutionName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Institution name is required when registering as instansi",
        path: ["institutionName"],
      });
    }

    if (data.role === "student" && !data.referralCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Kode referral sekolah wajib diisi",
        path: ["referralCode"],
      });
    }
  });

export class RegisterDto extends createZodDto(RegisterSchema) {}

export const LoginSchema = z.object({
  email: z
    .email("Email format is invalid")
    .max(255, "Email must not exceed 255 characters")
    .describe("Registered email address"),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .describe("Account password"),
});

export class LoginDto extends createZodDto(LoginSchema) {}

export const LogoutSchema = z
  .object({})
  .describe("Empty body for logout request");

export class logoutDto extends createZodDto(LogoutSchema) {}
