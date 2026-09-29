export interface Permission {
  id: string;
  name: string;
  module: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CreatePermissionInput {
  name: string;
  module: string;
  description?: string | null;
}

export interface UpdatePermissionInput {
  name?: string;
  module?: string;
  description?: string | null;
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
