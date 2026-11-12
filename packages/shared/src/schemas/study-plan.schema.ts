import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const CreateStudyPlanSchema = z.object({
  student_id: z.string().uuid().describe("ID Siswa yang mendaftar KRS"),
  class_subject_id: z
    .string()
    .uuid()
    .describe("ID Mata Pelajaran Kelas yang diambil"),
  academic_year_id: z
    .string()
    .uuid()
    .optional()
    .describe(
      "ID Tahun Ajaran (opsional, jika tidak dikirim akan otomatis mengikuti tahun ajaran mata pelajaran kelas)",
    ),
});

export const UpdateStudyPlanSchema = z.object({
  student_id: z
    .string()
    .uuid()
    .optional()
    .describe("ID Siswa yang mendaftar KRS"),
  class_subject_id: z
    .string()
    .uuid()
    .optional()
    .describe("ID Mata Pelajaran Kelas yang diambil"),
  academic_year_id: z.string().uuid().optional().describe("ID Tahun Ajaran"),
});

export const StudyPlanQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .optional()
    .default(1)
    .describe("Nomor halaman (default: 1)"),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .describe("Jumlah data per halaman (default: 10)"),
  search: z
    .string()
    .optional()
    .describe(
      "Pencarian berdasarkan nama siswa, NISN, atau kode/nama mata pelajaran",
    ),
  student_id: z
    .string()
    .uuid()
    .optional()
    .describe("Filter berdasarkan ID Siswa"),
  class_subject_id: z
    .string()
    .uuid()
    .optional()
    .describe("Filter berdasarkan ID Mata Pelajaran Kelas"),
  academic_year_id: z
    .string()
    .uuid()
    .optional()
    .describe("Filter berdasarkan ID Tahun Ajaran"),
  department_id: z
    .string()
    .uuid()
    .optional()
    .describe("Filter berdasarkan ID Departemen / Bidang"),
});

export class CreateStudyPlanDto extends createZodDto(CreateStudyPlanSchema) {}
export class UpdateStudyPlanDto extends createZodDto(UpdateStudyPlanSchema) {}
export class StudyPlanQueryDto extends createZodDto(StudyPlanQuerySchema) {}
