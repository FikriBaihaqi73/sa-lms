import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(255, 'Nama lengkap maksimal 255 karakter'),
  identityNumber: z
    .string()
    .max(255, 'Nomor identitas maksimal 255 karakter')
    .optional(),
  gender: z
    .string()
    .optional(),
  birthPlace: z
    .string()
    .max(255, 'Tempat lahir maksimal 255 karakter')
    .optional(),
  birthDate: z
    .string()
    .optional(),
  religionId: z
    .string()
    .optional(),
  nationalityId: z
    .string()
    .optional(),
  address: z
    .string()
    .max(500, 'Alamat maksimal 500 karakter')
    .optional(),
  phoneNumber: z
    .string()
    .max(255, 'Nomor telepon maksimal 255 karakter')
    .optional(),
  email: z
    .string()
    .email('Format email tidak valid')
    .or(z.literal(''))
    .optional(),
  photoUrl: z
    .string()
    .url('Format URL foto tidak valid')
    .or(z.literal(''))
    .optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
