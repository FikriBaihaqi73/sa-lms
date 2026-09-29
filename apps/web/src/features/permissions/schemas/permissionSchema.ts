import { z } from 'zod';

export const permissionFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Permission name is required')
    .max(255, 'Permission name must not exceed 255 characters'),
  module: z
    .string()
    .min(1, 'Module name is required')
    .max(255, 'Module name must not exceed 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .nullable(),
});

export type PermissionFormValues = z.infer<typeof permissionFormSchema>;
