import { z } from "zod";

const optionalUuid = z
  .string()
  .uuid("Pilihan tidak valid.")
  .optional()
  .or(z.literal(""));

export const teacherFormSchema = z.object({
  profile_id: z.string().uuid("Profil guru wajib dipilih."),
  teacher_number: z
    .string()
    .trim()
    .min(1, "NIP / nomor guru wajib diisi.")
    .max(100, "NIP maksimal 100 karakter.")
    .describe("Nomor Induk Pegawai atau nomor registrasi guru"),
  specialization_id: optionalUuid.describe("Spesialisasi guru"),
  employment_status_id: optionalUuid.describe("Status kepegawaian guru"),
  join_date: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .describe("Tanggal bergabung guru (YYYY-MM-DD)"),
});

export type TeacherFormInput = z.input<typeof teacherFormSchema>;
export type TeacherFormValues = z.output<typeof teacherFormSchema>;
