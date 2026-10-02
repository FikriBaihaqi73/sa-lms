import { z } from 'zod';

export const nationalityFormSchema = z.object({
  name: z.string().trim().min(1, 'Nama kewarganegaraan wajib diisi.'),
  description: z.string().trim().optional(),
});

export type NationalityFormValues = z.infer<typeof nationalityFormSchema>;
