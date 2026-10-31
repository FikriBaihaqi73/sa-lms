import { z } from "zod";

export const SCHEDULE_DAYS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
] as const;

export const scheduleFormSchema = z
  .object({
    classSubjectId: z
      .string()
      .uuid("Pilihan mata pelajaran kelas wajib dipilih.")
      .min(1, "Mata pelajaran kelas wajib dipilih."),
    classroomId: z
      .string()
      .uuid("Pilihan ruangan wajib dipilih.")
      .min(1, "Ruangan wajib dipilih."),
    day: z
      .string()
      .min(1, "Hari jadwal wajib dipilih.")
      .refine(
        (val) => SCHEDULE_DAYS.includes(val as (typeof SCHEDULE_DAYS)[number]),
        {
          message: "Hari harus salah satu dari Senin - Minggu.",
        },
      ),
    startTime: z
      .string()
      .optional()
      .or(z.literal("")),
    endTime: z
      .string()
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: "Jam selesai harus lebih akhir daripada jam mulai.",
      path: ["endTime"],
    },
  );

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;
