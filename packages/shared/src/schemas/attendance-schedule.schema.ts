import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const ATTENDANCE_DAYS = [
  "SENIN",
  "SELASA",
  "RABU",
  "KAMIS",
  "JUMAT",
  "SABTU",
  "MINGGU",
] as const;

export const attendanceDayEnum = z
  .enum(ATTENDANCE_DAYS)
  .describe("Hari aktif absensi (SENIN-MINGGU)");

export const ATTENDANCE_SCHEDULE_TYPES = [
  "FROM_SCHEDULE",
  "STANDALONE",
] as const;

export const attendanceScheduleTypeEnum = z
  .enum(ATTENDANCE_SCHEDULE_TYPES)
  .describe("Tipe jadwal absensi: FROM_SCHEDULE atau STANDALONE");

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function toMinutes(val: string): number | null {
  const match = timePattern.exec(val.trim());
  if (match) {
    return Number(match[1]) * 60 + Number(match[2]);
  }
  const parsed = Date.parse(val);
  if (!Number.isNaN(parsed)) {
    const d = new Date(parsed);
    return d.getUTCHours() * 60 + d.getUTCMinutes();
  }
  return null;
}

function isValidTimeOrEmpty(val: string | null | undefined): boolean {
  if (!val || val.trim() === "") return true;
  return timePattern.test(val.trim()) || !Number.isNaN(Date.parse(val));
}

function isValidDateOrEmpty(val: string | null | undefined): boolean {
  if (!val || val.trim() === "") return true;
  return datePattern.test(val.trim()) || !Number.isNaN(Date.parse(val));
}

const baseAttendanceScheduleObject = z.object({
  academicYearId: z
    .string()
    .uuid("ID tahun ajaran harus berupa UUID valid")
    .describe("ID tahun ajaran"),
  classId: z
    .string()
    .uuid("ID kelas harus berupa UUID valid")
    .describe("ID kelas"),
  scheduleId: z
    .string()
    .uuid("ID jadwal pelajaran harus berupa UUID valid")
    .nullable()
    .optional()
    .describe("ID jadwal pelajaran (wajib jika FROM_SCHEDULE)"),
  title: z
    .string()
    .trim()
    .min(1, "Nama jadwal absensi wajib diisi")
    .max(255, "Nama jadwal absensi maksimal 255 karakter")
    .describe("Nama sesi atau jadwal absensi"),
  scheduleType: attendanceScheduleTypeEnum,
  activeDays: z
    .array(attendanceDayEnum)
    .default([])
    .describe("Daftar hari aktif mingguan"),
  specificDate: z
    .string()
    .refine(isValidDateOrEmpty, {
      message: "Format tanggal spesifik tidak valid (YYYY-MM-DD)",
    })
    .nullable()
    .optional()
    .describe("Tanggal spesifik untuk jadwal insidental/pengganti"),
  startTime: z
    .string()
    .refine(isValidTimeOrEmpty, {
      message: "Format jam mulai tidak valid (HH:mm)",
    })
    .nullable()
    .optional()
    .describe("Jam mulai absensi (HH:mm)"),
  endTime: z
    .string()
    .refine(isValidTimeOrEmpty, {
      message: "Format jam selesai tidak valid (HH:mm)",
    })
    .nullable()
    .optional()
    .describe("Jam selesai absensi (HH:mm)"),
  isActive: z
    .boolean()
    .default(true)
    .describe("Status aktif atau nonaktif jadwal absensi"),
  notes: z
    .string()
    .max(2000, "Catatan maksimal 2000 karakter")
    .nullable()
    .optional()
    .describe("Catatan tambahan jadwal absensi"),
});

export const createAttendanceScheduleSchema =
  baseAttendanceScheduleObject.superRefine((data, ctx) => {
    if (data.scheduleType === "FROM_SCHEDULE" && !data.scheduleId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduleId"],
        message: "Jadwal pelajaran wajib dipilih jika tipe FROM_SCHEDULE",
      });
    }
    if (data.startTime && data.endTime) {
      const startMin = toMinutes(data.startTime);
      const endMin = toMinutes(data.endTime);
      if (startMin !== null && endMin !== null && endMin <= startMin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endTime"],
          message: "Jam selesai harus lebih besar dari jam mulai",
        });
      }
    }
  });

export const updateAttendanceScheduleSchema = baseAttendanceScheduleObject
  .partial()
  .superRefine((data, ctx) => {
    if (data.scheduleType === "FROM_SCHEDULE" && data.scheduleId === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduleId"],
        message: "Jadwal pelajaran wajib dipilih jika tipe FROM_SCHEDULE",
      });
    }
    if (data.startTime && data.endTime) {
      const startMin = toMinutes(data.startTime);
      const endMin = toMinutes(data.endTime);
      if (startMin !== null && endMin !== null && endMin <= startMin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endTime"],
          message: "Jam selesai harus lebih besar dari jam mulai",
        });
      }
    }
  });

export const toggleAttendanceScheduleStatusSchema = z.object({
  isActive: z.boolean().describe("Status aktif/nonaktif baru"),
});

export const updateAttendanceScheduleDaysSchema = z.object({
  activeDays: z
    .array(attendanceDayEnum)
    .describe("Daftar hari aktif mingguan terbaru"),
});

export const listAttendanceScheduleQuerySchema = z.object({
  academicYearId: z
    .string()
    .uuid()
    .optional()
    .describe("Filter berdasarkan tahun ajaran"),
  classId: z
    .string()
    .uuid()
    .optional()
    .describe("Filter berdasarkan kelas"),
  scheduleType: attendanceScheduleTypeEnum.optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .describe("Filter berdasarkan status aktif (true/false)"),
  search: z
    .string()
    .optional()
    .describe("Pencarian berdasarkan judul atau mata pelajaran"),
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1)
    .describe("Nomor halaman"),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Jumlah data per halaman"),
});

export class CreateAttendanceScheduleDto extends createZodDto(
  createAttendanceScheduleSchema,
) {}
export class UpdateAttendanceScheduleDto extends createZodDto(
  updateAttendanceScheduleSchema,
) {}
export class ToggleAttendanceScheduleStatusDto extends createZodDto(
  toggleAttendanceScheduleStatusSchema,
) {}
export class UpdateAttendanceScheduleDaysDto extends createZodDto(
  updateAttendanceScheduleDaysSchema,
) {}
export class ListAttendanceScheduleQueryDto extends createZodDto(
  listAttendanceScheduleQuerySchema,
) {}

export type CreateAttendanceScheduleInput = z.infer<
  typeof createAttendanceScheduleSchema
>;
export type UpdateAttendanceScheduleInput = z.infer<
  typeof updateAttendanceScheduleSchema
>;
export type ToggleAttendanceScheduleStatusInput = z.infer<
  typeof toggleAttendanceScheduleStatusSchema
>;
export type UpdateAttendanceScheduleDaysInput = z.infer<
  typeof updateAttendanceScheduleDaysSchema
>;
export type ListAttendanceScheduleQueryInput = z.infer<
  typeof listAttendanceScheduleQuerySchema
>;
