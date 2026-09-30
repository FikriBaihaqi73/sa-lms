import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email wajib diisi')
  .email('Format email tidak valid')
  .max(255, 'Email maksimal 255 karakter');

const passwordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .max(128, 'Password maksimal 128 karakter');

export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  is_active: z.boolean(),
});

export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  password: z
    .string()
    .max(128, 'Password maksimal 128 karakter')
    .refine((value) => value.length === 0 || value.length >= 8, 'Password minimal 8 karakter')
    .optional(),
  is_active: z.boolean().optional(),
});

export const userFormSchema = createUserSchema;

export type UserFormValues = z.infer<typeof createUserSchema>;
