export interface AttendanceStatus {
  id: string;
  institution_id: string;
  name: string;
  description: string | null;
  color?: string | null;
  icon?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceStatusPageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AttendanceStatusesResponse {
  data: AttendanceStatus[];
  meta: AttendanceStatusPageMeta;
}

export interface ApiResponse<T> {
  status: string;
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

export interface CreateAttendanceStatusInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export type UpdateAttendanceStatusInput = Partial<CreateAttendanceStatusInput>;

export interface DeleteAttendanceStatusResult {
  success: boolean;
  id: string;
}
