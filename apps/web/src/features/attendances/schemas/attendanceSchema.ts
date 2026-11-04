import { z } from "zod";

export const attendanceFormSchema = z.object({
  schedule_id: z.string().uuid("Pilih jadwal pelajaran yang valid"),
  student_id: z.string().uuid("Pilih siswa yang valid"),
  attendance_status_id: z.string().uuid("Pilih status kehadiran yang valid"),
  attendance_date: z.string().min(1, "Tanggal kehadiran wajib diisi"),
  notes: z.string().optional(),
});

export type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;

