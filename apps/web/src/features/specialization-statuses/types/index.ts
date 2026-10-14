export interface Specialization {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Type alias agar kompatibel dengan penamaan lama jika ada modul yang mengimpor nama lama
 */
export type SpecializationStatus = Specialization;

export interface CreateSpecializationInput {
  name: string;
  description?: string | null;
}

export type CreateSpecializationStatusInput = CreateSpecializationInput;

export interface UpdateSpecializationInput {
  name?: string;
  description?: string | null;
}

export type UpdateSpecializationStatusInput = UpdateSpecializationInput;

export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
}
