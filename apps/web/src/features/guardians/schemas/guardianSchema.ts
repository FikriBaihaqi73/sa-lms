import { z } from "zod";

const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message).optional().or(z.literal(""));

export const guardianFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Nama lengkap guardian wajib diisi.")
    .max(255, "Nama lengkap guardian maksimal 255 karakter."),
  relationship: optionalText(100, "Hubungan dengan siswa maksimal 100 karakter."),
  phoneNumber: optionalText(30, "Nomor telepon maksimal 30 karakter."),
  email: z
    .string()
    .trim()
    .max(255, "Email maksimal 255 karakter.")
    .email("Format email tidak valid.")
    .optional()
    .or(z.literal("")),
  address: optionalText(255, "Alamat maksimal 255 karakter."),
  occupation: optionalText(100, "Pekerjaan maksimal 100 karakter."),
});

export type GuardianFormValues = z.infer<typeof guardianFormSchema>;
