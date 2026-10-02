import type { RegisterSchema } from '@repo/shared/schemas/auth.schema';
import * as z from 'zod';
import { apiFetch } from '@/lib/api';

type RegisterDto = z.infer<typeof RegisterSchema>;

/**
 * Real API call for registering via the NestJS Backend with fallback for preview mode.
 */
export const registerApi = async (data: RegisterDto): Promise<void> => {
  try {
    await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Backend API offline during dev registration, returning mock success for preview.');
      return;
    }
    throw error;
  }
};
