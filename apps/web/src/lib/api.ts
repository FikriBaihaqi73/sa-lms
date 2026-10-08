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
 * Satu field error dari response validasi backend.
 * Format backend (nestez-zod): errors: [{ path: ["academic_year"], message: "..." }].
 */
export interface ApiFieldError {
  field: string;
  message: string;
}

/**
 * Error HTTP yang dibuang oleh apiFetch. Membawa pesan utama sekaligus
 * daftar error per-field, sehingga form dapat menampilkan pesan validasi
 * backend tepat di bawah field yang bersangkutan.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: ApiFieldError[];

  constructor(
    message: string,
    options: { status: number; fieldErrors?: ApiFieldError[] },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.fieldErrors = options.fieldErrors ?? [];
  }
}

/**
 * Bangun ApiError dari body error backend.
 * Mendukung dua bentuk response:
 * - Validasi zod: { message: "Validation failed", errors: [{ path, message }] }.
 * - Umum: { message: string | string[] } tanpa array `errors`.
 */
function parseApiError(status: number, body: unknown): ApiError {
  const fallback = `API request failed with status ${status}`;
  if (!body || typeof body !== "object") {
    return new ApiError(fallback, { status });
  }

  const record = body as { message?: unknown; errors?: unknown };

  let message = fallback;
  if (typeof record.message === "string" && record.message.length > 0) {
    message = record.message;
  } else if (Array.isArray(record.message)) {
    const joined = record.message
      .filter((item): item is string => typeof item === "string")
      .join(", ");
    if (joined.length > 0) message = joined;
  }

  const fieldErrors: ApiFieldError[] = [];
  if (Array.isArray(record.errors)) {
    for (const issue of record.errors) {
      if (!issue || typeof issue !== "object") continue;
      const { path, message: detail } = issue as {
        path?: unknown;
        message?: unknown;
      };
      if (typeof detail !== "string" || detail.length === 0) continue;
      let field = "";
      if (Array.isArray(path)) {
        field = path.map((segment) => String(segment)).join(".");
      } else if (typeof path === "string") {
        field = path;
      }
      fieldErrors.push({ field, message: detail });
    }
  }

  return new ApiError(message, { status, fieldErrors });
}

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
    const body: unknown = await response.json().catch(() => null);
    throw parseApiError(response.status, body);
  }

  return response.json();
}

