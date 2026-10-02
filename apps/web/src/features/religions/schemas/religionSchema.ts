import { z } from 'zod';

export const religionFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama religion wajib diisi.')
    .max(100, 'Nama religion maksimal 100 karakter.'),
});

export type ReligionFormValues = z.infer<typeof religionFormSchema>;
