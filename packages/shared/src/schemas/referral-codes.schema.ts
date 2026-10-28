import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const CreateReferralCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, "Kode referral minimal 3 karakter")
    .max(100, "Kode referral maksimal 100 karakter")
    .optional()
    .describe("Kode referral unik (dibuat otomatis jika tidak diisi)"),
  institutionId: z
    .string()
    .uuid("Format UUID institutionId tidak valid")
    .optional()
    .describe(
      "ID Institusi pemilik kode referral (otomatis dari sesi jika tidak diisi)",
    ),
  usageQuota: z
    .number()
    .int("Kuota harus berupa bilangan bulat")
    .min(1, "Kuota minimal 1 penggunaan")
    .optional()
    .nullable()
    .describe("Batas jumlah pendaftar (kosong/null jika tanpa batas)"),
  enrollmentYear: z
    .number()
    .int("Tahun masuk harus berupa bilangan bulat")
    .min(2025, "Pilihan tahun masuk mulai dari 2025")
    .optional()
    .nullable()
    .describe("Tahun masuk akademik untuk siswa yang mendaftar"),
  departmentId: z
    .string()
    .uuid("Format UUID departmentId tidak valid")
    .optional()
    .nullable()
    .describe(
      "ID Jurusan khusus (kosong/null jika berlaku untuk semua jurusan)",
    ),
  expiresAt: z
    .string()
    .datetime({ message: "Format tanggal kedaluwarsa harus ISO 8601" })
    .or(
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
    )
    .or(z.literal(""))
    .optional()
    .nullable()
    .describe(
      "Tanggal kedaluwarsa kode referral (kosong/null jika tanpa batas)",
    ),
  isActive: z
    .boolean()
    .optional()
    .default(true)
    .describe("Status keaktifan kode referral"),
});

export const UpdateReferralCodeSchema = z.object({
  usageQuota: z
    .number()
    .int("Kuota harus berupa bilangan bulat")
    .min(1, "Kuota minimal 1 penggunaan")
    .optional()
    .nullable()
    .describe("Batas jumlah pendaftar (kosong/null jika tanpa batas)"),
  enrollmentYear: z
    .number()
    .int("Tahun masuk harus berupa bilangan bulat")
    .min(2025, "Pilihan tahun masuk mulai dari 2025")
    .optional()
    .nullable()
    .describe("Tahun masuk akademik"),
  departmentId: z
    .string()
    .uuid("Format UUID departmentId tidak valid")
    .optional()
    .nullable()
    .describe(
      "ID Jurusan khusus (kosong/null jika berlaku untuk semua jurusan)",
    ),
  expiresAt: z
    .string()
    .datetime({ message: "Format tanggal kedaluwarsa harus ISO 8601" })
    .or(
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
    )
    .or(z.literal(""))
    .optional()
    .nullable()
    .describe("Tanggal kedaluwarsa kode referral"),
  isActive: z
    .boolean()
    .optional()
    .describe("Status keaktifan kode referral (aktif/nonaktif)"),
});

export const QueryReferralCodeSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .optional()
    .default(1)
    .describe("Nomor halaman"),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .describe("Jumlah data per halaman"),
  search: z
    .string()
    .trim()
    .optional()
    .describe("Pencarian berdasarkan kode referral"),
  status: z
    .enum(["all", "active", "inactive", "expired", "exhausted"])
    .optional()
    .default("all")
    .describe("Filter status kode referral"),
  departmentId: z
    .string()
    .uuid()
    .optional()
    .describe("Filter berdasarkan jurusan"),
  enrollmentYear: z.coerce
    .number()
    .int()
    .optional()
    .describe("Filter berdasarkan tahun masuk"),
});

export class CreateReferralCodeDto extends createZodDto(
  CreateReferralCodeSchema,
) {}
export class UpdateReferralCodeDto extends createZodDto(
  UpdateReferralCodeSchema,
) {}
export class QueryReferralCodeDto extends createZodDto(
  QueryReferralCodeSchema,
) {}
