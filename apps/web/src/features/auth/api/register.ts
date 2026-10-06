import type { RegisterSchema } from '@repo/shared/schemas/auth.schema';
import * as z from 'zod';
import { apiFetch } from '@/lib/api';

type RegisterDto = z.infer<typeof RegisterSchema>;

/**
 * Real API call for registering via the NestJS Backend.
 */
export const registerApi = async (data: RegisterDto): Promise<void> => {
  await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
