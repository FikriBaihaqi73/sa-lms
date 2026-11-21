import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

export const CreateStudentGradeSchema = z.object({
  studentId: z
    .string()
    .uuid("studentId harus berupa UUID yang valid.")
    .describe("ID siswa"),
  classSubjectId: z
    .string()
    .uuid("classSubjectId harus berupa UUID yang valid.")
    .describe("ID mata pelajaran kelas"),
  academicYearId: z
    .string()
    .uuid("academicYearId harus berupa UUID yang valid.")
    .describe("ID tahun ajaran"),
  assignmentScore: z
    .number()
    .min(0, "assignmentScore minimal 0.")
    .max(100, "assignmentScore maksimal 100.")
    .refine(
      (value) => Number.isInteger(value * 100),
      "assignmentScore maksimal 2 angka desimal.",
    )
    .nullable()
    .optional()
    .describe("Nilai tugas"),
  quizScore: z
    .number()
    .min(0, "quizScore minimal 0.")
    .max(100, "quizScore maksimal 100.")
    .refine(
      (value) => Number.isInteger(value * 100),
      "quizScore maksimal 2 angka desimal.",
    )
    .nullable()
    .optional()
    .describe("Nilai kuis"),
  midExamScore: z
    .number()
    .min(0, "midExamScore minimal 0.")
    .max(100, "midExamScore maksimal 100.")
    .refine(
      (value) => Number.isInteger(value * 100),
      "midExamScore maksimal 2 angka desimal.",
    )
    .nullable()
    .optional()
    .describe("Nilai UTS"),
  finalExamScore: z
    .number()
    .min(0, "finalExamScore minimal 0.")
    .max(100, "finalExamScore maksimal 100.")
    .refine(
      (value) => Number.isInteger(value * 100),
      "finalExamScore maksimal 2 angka desimal.",
    )
    .nullable()
    .optional()
    .describe("Nilai UAS"),
  finalScore: z
    .number()
    .min(0, "finalScore minimal 0.")
    .max(100, "finalScore maksimal 100.")
    .refine(
      (value) => Number.isInteger(value * 100),
      "finalScore maksimal 2 angka desimal.",
    )
    .nullable()
    .optional()
    .describe("Nilai akhir manual"),
  gradeId: z
    .string()
    .uuid("gradeId harus berupa UUID yang valid.")
    .nullable()
    .optional()
    .describe("ID huruf mutu"),
  remarks: z.string().nullable().optional().describe("Catatan nilai"),
});

export const UpdateStudentGradeSchema = CreateStudentGradeSchema.omit({
  studentId: true,
  classSubjectId: true,
  academicYearId: true,
}).partial();

export const StudentGradeQuerySchema = z.object({
  page: z.coerce
    .number()
    .int("Halaman harus berupa bilangan bulat.")
    .min(1, "Halaman minimal 1.")
    .default(1)
    .describe("Nomor halaman"),
  limit: z.coerce
    .number()
    .int("Batas data harus berupa bilangan bulat.")
    .min(1, "Batas data minimal 1.")
    .max(100, "Batas data maksimal 100.")
    .default(10)
    .describe("Jumlah data per halaman"),
  search: z
    .string()
    .optional()
    .describe("Pencarian nama siswa, nomor siswa, kelas, atau mata pelajaran"),
  classSubjectId: z
    .string()
    .uuid("Mata pelajaran kelas tidak valid.")
    .optional()
    .describe("ID mata pelajaran kelas"),
  academicYearId: z
    .string()
    .uuid("Tahun ajaran tidak valid.")
    .optional()
    .describe("ID tahun ajaran"),
  studentId: z
    .string()
    .uuid("Siswa tidak valid.")
    .optional()
    .describe("ID siswa"),
});

export class CreateStudentGradeDto extends createZodDto(
  CreateStudentGradeSchema,
) {}
export class UpdateStudentGradeDto extends createZodDto(
  UpdateStudentGradeSchema,
) {}
export class StudentGradeQueryDto extends createZodDto(
  StudentGradeQuerySchema,
) {}
