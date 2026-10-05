import { z } from 'zod';

export const specializationStatusFormSchema = z.object({
  name: z.string().trim().min(1, 'Nama status akademik wajib diisi.'),
  description: z.string().trim().optional(),
});

export type SpecializationStatusFormValues = z.infer<typeof specializationStatusFormSchema>;
