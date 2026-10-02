import { z } from "zod";

const nullableScore = z
  .number({ error: "Nilai harus antara 0 dan 100." })
  .min(0, "Nilai minimal 0.")
  .max(100, "Nilai maksimal 100.")
  .nullable()
  .describe("Nilai 0-100, kosongkan jika belum ada.");

export const gradeRowFormSchema = z.object({
  tugas: nullableScore,
  uts: nullableScore,
  uas: nullableScore,
});

export type GradeRowFormValues = z.infer<typeof gradeRowFormSchema>;

export const gradeFilterSchema = z.object({
  className: z.string().describe("Rombongan belajar yang dipilih."),
  subject: z.string().describe("Mata pelajaran yang dipilih."),
  semester: z.string().describe("Periode atau semester yang dipilih."),
  search: z.string().describe("Kata kunci pencarian siswa, kelas, atau kode mapel."),
});

export type GradeFilterValues = z.infer<typeof gradeFilterSchema>;
