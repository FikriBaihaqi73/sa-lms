/**
 * Centralized API configuration to ensure base URLs are never hardcoded.
 */

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "");

export const config = {
  apiUrl: API_URL,
};

/**
 * Standard fetch wrapper that prepends the base API URL and attaches Authorization header
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  if (!config.apiUrl) {
    throw new Error("VITE_API_URL belum dikonfigurasi.");
  }
  const url = `${config.apiUrl}${endpoint}`;
  
  const token = typeof window !== 'undefined' 
    ? (localStorage.getItem('access_token') || localStorage.getItem('token')) 
    : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API request failed with status ${response.status}`);
  }

  return response.json();
}

