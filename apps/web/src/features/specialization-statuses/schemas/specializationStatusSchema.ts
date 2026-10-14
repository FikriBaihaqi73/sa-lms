import { z } from 'zod';

export const specializationFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nama peminatan / konsentrasi minimal 2 karakter.')
    .max(255, 'Nama peminatan / konsentrasi maksimal 255 karakter.'),
  description: z
    .string()
    .max(1000, 'Deskripsi maksimal 1000 karakter.')
    .optional(),
});

export type SpecializationFormValues = z.infer<typeof specializationFormSchema>;

// Alias for backwards compatibility
export const specializationStatusFormSchema = specializationFormSchema;
export type SpecializationStatusFormValues = SpecializationFormValues;
