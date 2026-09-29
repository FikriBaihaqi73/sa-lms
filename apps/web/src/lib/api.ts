/**
 * Centralized API configuration to ensure base URLs are never hardcoded.
 */

const API_URL = import.meta.env.VITE_API_URL;

export const config = {
  apiUrl: API_URL,
};

/**
 * Standard fetch wrapper that prepends the base API URL
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  if (!config.apiUrl) {
    throw new Error("VITE_API_URL belum dikonfigurasi.");
  }
  const url = `${config.apiUrl}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API request failed with status ${response.status}`);
  }

  return response.json();
}
