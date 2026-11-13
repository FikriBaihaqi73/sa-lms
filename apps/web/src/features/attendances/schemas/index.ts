import { z } from "zod";

export const upsertAttendanceSchema = z.object({
  schedule_id: z
    .string()
    .uuid("Jadwal pelajaran wajib dipilih")
    .describe("ID Jadwal"),
  student_id: z.string().uuid("Siswa wajib dipilih").describe("ID Siswa"),
  attendance_status_id: z
    .string()
    .uuid("Status kehadiran wajib dipilih")
    .describe("ID Status Kehadiran"),
  attendance_date: z
    .string()
    .min(1, "Tanggal presensi wajib diisi")
    .describe("Tanggal Presensi (YYYY-MM-DD)"),
  notes: z.string().optional().nullable().describe("Catatan evaluasi/kendala"),
});

export type UpsertAttendanceFormValues = z.infer<typeof upsertAttendanceSchema>;

export const bulkUpsertAttendanceSchema = z.object({
  schedule_id: z
    .string()
    .uuid("Jadwal pelajaran wajib dipilih")
    .describe("ID Jadwal"),
  attendance_date: z
    .string()
    .min(1, "Tanggal presensi wajib diisi")
    .describe("Tanggal Presensi"),
  attendance_status_id: z
    .string()
    .uuid("Status kehadiran wajib dipilih")
    .describe("ID Status Kehadiran"),
  student_ids: z
    .array(z.string().uuid())
    .optional()
    .describe("Daftar ID siswa"),
  notes: z.string().optional().nullable().describe("Catatan bulk"),
});

export type BulkUpsertAttendanceFormValues = z.infer<
  typeof bulkUpsertAttendanceSchema
>;

export const attendanceNoteDialogSchema = z.object({
  attendance_status_id: z
    .string()
    .uuid("Status kehadiran wajib dipilih")
    .describe("ID Status Kehadiran"),
  notes: z.string().optional().describe("Catatan tambahan"),
});

export type AttendanceNoteDialogFormValues = z.infer<
  typeof attendanceNoteDialogSchema
>;

export const attendanceFilterSchema = z.object({
  search: z.string().optional(),
  class_id: z.string().optional(),
  schedule_id: z.string().optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().optional(),
  status_id: z.string().optional(),
});

export type AttendanceFilterValues = z.infer<typeof attendanceFilterSchema>;
