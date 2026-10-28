import { z } from "zod";

export const referralCodeFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Kode referral minimal 3 karakter.")
    .max(100, "Kode referral maksimal 100 karakter.")
    .optional()
    .or(z.literal("")),
  hasQuotaLimit: z.boolean().default(false),
  usageQuota: z
    .preprocess(
      (v) => (v === "" || v === null || Number.isNaN(Number(v)) ? undefined : Number(v)),
      z.number().int("Kuota harus berupa bilangan bulat.").min(1, "Kuota minimal 1 penggunaan.").optional(),
    ),
  enrollmentYear: z
    .preprocess(
      (v) =>
        v === "" || v === null || v === undefined || Number.isNaN(Number(v))
          ? undefined
          : Number(v),
      z
        .number()
        .int("Tahun masuk harus berupa angka bulat.")
        .min(2000, "Tahun masuk tidak valid.")
        .max(2100, "Tahun masuk tidak valid.")
        .optional(),
    ),
  departmentId: z
    .string()
    .uuid("Pilihan jurusan tidak valid.")
    .optional()
    .or(z.literal("")),
  hasExpiryLimit: z.boolean().default(false),
  expiresAt: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type ReferralCodeFormInput = z.input<typeof referralCodeFormSchema>;
export type ReferralCodeFormValues = z.output<typeof referralCodeFormSchema>;
