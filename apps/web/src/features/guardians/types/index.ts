export interface Guardian {
  id: string;
  fullName: string;
  relationship?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
  occupation?: string | null;
  createdAt: string;
  updatedAt: string;
  studentGuardians?: unknown[];
}

export interface GuardianPageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GuardiansResponse {
  data: Guardian[];
  meta: GuardianPageMeta;
}

export interface ApiResponse<T> {
  status: "success" | "error";
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

export interface CreateGuardianInput {
  fullName: string;
  relationship?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  occupation?: string;
}

export interface UpdateGuardianInput {
  fullName?: string;
  relationship?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  occupation?: string;
}
