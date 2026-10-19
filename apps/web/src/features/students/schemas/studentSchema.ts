import { z } from "zod";

const optionalNumber = z.preprocess(
  (value) => (typeof value === "number" && Number.isNaN(value) ? undefined : value),
  z.number().int("Tahun masuk harus berupa bilangan bulat.").optional(),
);

const optionalUuid = z
  .string()
  .uuid("Pilihan tidak valid.")
  .optional()
  .or(z.literal(""));

export const studentFormSchema = z.object({
  profileId: optionalUuid.describe("Profil mahasiswa (opsional)"),
  departmentId: optionalUuid.describe("Departemen mahasiswa"),
  academicStatusId: z.string().uuid("Status akademik wajib dipilih."),
  studentNumber: z.string().trim().min(1, "Nomor mahasiswa wajib diisi."),
  enrollmentYear: optionalNumber,
  referralCode: z
    .string()
    .trim()
    .max(100, "Kode referral maksimal 100 karakter.")
    .optional()
    .or(z.literal("")),
  referralExpiresAt: z.string().optional().or(z.literal("")),
});

export type StudentFormInput = z.input<typeof studentFormSchema>;
export type StudentFormValues = z.output<typeof studentFormSchema>;

