import type { User, LoginCredentials } from '../types';
import { apiFetch } from '@/lib/api';

/**
 * Real API call for logging in via the NestJS Backend
 */
export const loginApi = async (credentials: LoginCredentials): Promise<User> => {
  const response = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  if (response.data?.accessToken) {
    localStorage.setItem('access_token', response.data.accessToken);
    localStorage.setItem('token', response.data.accessToken);
  }

  return response.data?.user || response.data;
};
