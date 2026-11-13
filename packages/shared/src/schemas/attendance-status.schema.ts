import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

const colorRegex = /^#[0-9A-Fa-f]{6}$/;

function isAllowedIcon(val: string): boolean {
  const standardIcons = ["check", "x", "alert", "clock"];
  if (standardIcons.includes(val)) return true;
  return /^letter:[A-Za-z]$/.test(val);
}

export const CreateAttendanceStatusSchema = z.object({
  name: z
    .string()
    .min(1)
    .describe("Attendance status name within the institution"),
  description: z.string().optional().describe("Attendance status description"),
  color: z
    .string()
    .regex(colorRegex, "Warna harus berupa kode HEX valid (contoh: #2563EB)")
    .optional()
    .default("#2563EB")
    .describe("Warna badge status dalam format HEX (#RRGGBB)"),
  icon: z
    .string()
    .refine(
      isAllowedIcon,
      "Ikon harus berupa salah satu ikon standar (check, x, alert, clock) atau huruf (letter:A - letter:Z)",
    )
    .optional()
    .default("check")
    .describe("Ikon badge status (check, x, alert, clock, atau letter:A-Z)"),
});

export const UpdateAttendanceStatusSchema =
  CreateAttendanceStatusSchema.partial();

export class CreateAttendanceStatusDto extends createZodDto(
  CreateAttendanceStatusSchema,
) {}
export class UpdateAttendanceStatusDto extends createZodDto(
  UpdateAttendanceStatusSchema,
) {}
