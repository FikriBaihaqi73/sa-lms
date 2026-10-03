import { z } from 'zod';

export const academicStatusFormSchema = z.object({
  name: z.string().trim().min(1, 'Nama status akademik wajib diisi.'),
  description: z.string().trim().optional(),
});

export type AcademicStatusFormValues = z.infer<typeof academicStatusFormSchema>;
