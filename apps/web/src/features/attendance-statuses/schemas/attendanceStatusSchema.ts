import { z } from 'zod';

export const attendanceStatusFormSchema = z.object({
  name: z.string().trim().min(1, 'Nama status wajib diisi.'),
  description: z.string().trim().optional(),
});

export type AttendanceStatusFormValues = z.infer<typeof attendanceStatusFormSchema>;
