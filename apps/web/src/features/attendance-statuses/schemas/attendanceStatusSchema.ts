import { z } from "zod";
import {
  isValidColorHex,
  isValidIconIdentifier,
} from "../components/attendance-status-icon";

export const attendanceStatusFormSchema = z.object({
  name: z.string().trim().min(1, "Nama status wajib diisi."),
  description: z.string().trim().optional(),
  color: z
    .string()
    .trim()
    .refine((val) => isValidColorHex(val), {
      message: "Format warna harus HEX yang valid (contoh: #2563EB)",
    }),
  icon: z
    .string()
    .trim()
    .min(1, "Ikon wajib dipilih.")
    .refine((val) => isValidIconIdentifier(val), {
      message: "Ikon atau huruf tidak valid.",
    }),
});

export type AttendanceStatusFormValues = z.infer<
  typeof attendanceStatusFormSchema
>;
