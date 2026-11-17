import { createZodDto } from "nestjs-zod/dto";
import { z } from "zod";

const isoDateTimeSchema = z
  .string()
  .datetime({ message: "Tanggal harus berupa ISO 8601 yang valid." });

const durationSchema = z
  .number()
  .int("Durasi harus berupa bilangan bulat.")
  .min(0, "Durasi tidak boleh negatif.")
  .max(2_147_483_647, "Durasi melebihi batas teknis.")
  .describe("Durasi ujian dalam menit");

const maximumScoreSchema = z
  .number()
  .min(0, "Nilai maksimum tidak boleh negatif.")
  .max(999.99, "Nilai maksimum tidak boleh lebih dari 999,99.")
  .describe("Nilai maksimum ujian");

export const CreateExaminationSchema = z.object({
  classSubjectId: z
    .string()
    .uuid("Mata pelajaran kelas wajib dipilih.")
    .describe("ID mata pelajaran kelas yang terkait dengan ujian"),
  assignmentTypeId: z
    .string()
    .uuid("Jenis tugas tidak valid.")
    .optional()
    .describe("ID jenis tugas ujian, jika ada"),
  title: z
    .string()
    .min(1, "Judul ujian wajib diisi.")
    .max(255, "Judul ujian maksimal 255 karakter.")
    .describe("Judul ujian"),
  description: z.string().optional().describe("Deskripsi ujian"),
  examinationDate: isoDateTimeSchema
    .optional()
    .describe("Tanggal dan waktu ujian dalam format ISO 8601"),
  duration: durationSchema.optional(),
  maximumScore: maximumScoreSchema.optional(),
});

export const UpdateExaminationSchema = z.object({
  classSubjectId: z
    .string()
    .uuid("Mata pelajaran kelas tidak valid.")
    .optional()
    .describe("ID mata pelajaran kelas yang terkait dengan ujian"),
  assignmentTypeId: z
    .string()
    .uuid("Jenis tugas tidak valid.")
    .optional()
    .describe("ID jenis tugas ujian, jika ada"),
  title: z
    .string()
    .min(1, "Judul ujian wajib diisi.")
    .max(255, "Judul ujian maksimal 255 karakter.")
    .optional()
    .describe("Judul ujian"),
  description: z.string().optional().describe("Deskripsi ujian"),
  examinationDate: isoDateTimeSchema
    .optional()
    .describe("Tanggal dan waktu ujian dalam format ISO 8601"),
  duration: durationSchema.optional(),
  maximumScore: maximumScoreSchema.optional(),
});

export const ExaminationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).describe("Nomor halaman"),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(10)
    .describe("Jumlah data per halaman"),
  search: z
    .string()
    .optional()
    .describe("Pencarian judul atau deskripsi ujian"),
  classSubjectId: z
    .string()
    .uuid("Filter mata pelajaran kelas tidak valid.")
    .optional()
    .describe("Filter berdasarkan mata pelajaran kelas"),
  assignmentTypeId: z
    .string()
    .uuid("Filter jenis tugas tidak valid.")
    .optional()
    .describe("Filter berdasarkan jenis tugas"),
  dateFrom: isoDateTimeSchema.optional().describe("Tanggal awal filter ujian"),
  dateTo: isoDateTimeSchema.optional().describe("Tanggal akhir filter ujian"),
});

export class CreateExaminationDto extends createZodDto(
  CreateExaminationSchema,
) {}
export class UpdateExaminationDto extends createZodDto(
  UpdateExaminationSchema,
) {}
export class ExaminationQueryDto extends createZodDto(ExaminationQuerySchema) {}
