import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const CreateTeacherSchema = z.object({
  // 1. Akun Login & Profil
  full_name: z
    .string()
    .min(1, "Nama lengkap guru wajib diisi")
    .max(255, "Nama lengkap maksimal 255 karakter")
    .describe("Nama lengkap guru (disimpan ke Profil)"),
  email: z
    .string()
    .email("Format email tidak valid")
    .max(255, "Email maksimal 255 karakter")
    .describe("Email akun login guru (disimpan ke Users)"),
  password: z
    .string()
    .min(8, "Password awal minimal 8 karakter")
    .max(100, "Password maksimal 100 karakter")
    .describe("Password awal akun login guru (di-hash dengan bcrypt)"),
  gender: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .describe("Jenis kelamin guru (misal: Laki-laki / Perempuan)"),
  phone: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .describe("Nomor telepon atau WhatsApp guru"),

  // 2. Data Kepegawaian & Guru
  teacher_number: z
    .string()
    .min(1, "NIP / Nomor Induk Pengajar wajib diisi")
    .max(100, "NIP maksimal 100 karakter")
    .describe("Nomor Induk Pegawai / nomor registrasi guru yang unik"),
  join_date: z
    .string()
    .refine(
      (val) => !Number.isNaN(Date.parse(val)),
      "Format tanggal tidak valid (YYYY-MM-DD)",
    )
    .optional()
    .nullable()
    .describe("Tanggal bergabung guru (YYYY-MM-DD)"),
  employment_status_id: z
    .string()
    .uuid("Format UUID status kepegawaian tidak valid")
    .optional()
    .nullable()
    .describe("ID status kepegawaian (Tetap, Honorer, dll.)"),
  specialization_id: z
    .string()
    .uuid("Format UUID spesialisasi tidak valid")
    .optional()
    .nullable()
    .describe("ID bidang spesialisasi mata pelajaran guru"),
  department_id: z
    .string()
    .uuid("Format UUID departemen tidak valid")
    .optional()
    .nullable()
    .describe("ID departemen tempat guru bernaung"),

  // Legacy fallback optional field
  profile_id: z
    .string()
    .uuid("Format UUID profile_id tidak valid")
    .optional()
    .nullable()
    .describe("ID profil (opsional jika menggunakan onboarding terpadu)"),
});

export const UpdateTeacherSchema = z.object({
  // 1. Pembaruan Profil & Akun
  full_name: z
    .string()
    .min(1, "Nama lengkap tidak boleh kosong")
    .max(255)
    .optional()
    .describe("Nama lengkap guru"),
  email: z
    .string()
    .email("Format email tidak valid")
    .max(255)
    .optional()
    .describe("Email akun login guru"),
  password: z
    .string()
    .min(8, "Password baru minimal 8 karakter")
    .max(100)
    .optional()
    .nullable()
    .or(z.literal(""))
    .describe("Password baru (kosongkan jika tidak ingin mengubah password)"),
  gender: z.string().max(50).optional().nullable().describe("Jenis kelamin"),
  phone: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .describe("Nomor telepon atau WhatsApp guru"),

  // 2. Pembaruan Data Kepegawaian
  teacher_number: z
    .string()
    .min(1, "NIP tidak boleh kosong")
    .max(100)
    .optional()
    .describe("Nomor Induk Pegawai / NIP guru"),
  join_date: z
    .string()
    .refine(
      (val) => !Number.isNaN(Date.parse(val)),
      "Format tanggal tidak valid (YYYY-MM-DD)",
    )
    .optional()
    .nullable()
    .describe("Tanggal bergabung guru (YYYY-MM-DD)"),
  employment_status_id: z
    .string()
    .uuid("Format UUID status kepegawaian tidak valid")
    .optional()
    .nullable()
    .describe("ID status kepegawaian"),
  specialization_id: z
    .string()
    .uuid("Format UUID spesialisasi tidak valid")
    .optional()
    .nullable()
    .describe("ID bidang spesialisasi"),
  department_id: z
    .string()
    .uuid("Format UUID departemen tidak valid")
    .optional()
    .nullable()
    .describe("ID departemen"),

  // Legacy fallback optional field
  profile_id: z
    .string()
    .uuid("Format UUID profile_id tidak valid")
    .optional()
    .nullable()
    .describe("ID profil"),
});

export class CreateTeacherDto extends createZodDto(CreateTeacherSchema) {}
export class UpdateTeacherDto extends createZodDto(UpdateTeacherSchema) {}
