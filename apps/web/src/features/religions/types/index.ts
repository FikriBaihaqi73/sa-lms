export interface Religion {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReligionPageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReligionsResponse {
  data: Religion[];
  meta: ReligionPageMeta;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  code: number;
  message: string;
  data: T;
  meta?: {
    totalData?: number;
    totalPages?: number;
    currentPage?: number;
    perPage?: number;
  };
}

export interface CreateReligionInput {
  name: string;
}

export interface UpdateReligionInput {
  name?: string;
}

export interface DeleteReligionResult {
  success: boolean;
  id: string;
}
