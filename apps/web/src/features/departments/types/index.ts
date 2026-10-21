export interface DepartmentTeacher {
  id: string;
  teacher_number: string;
  profile?: {
    id: string;
    fullName: string;
    email?: string | null;
    phoneNumber?: string | null;
    photoUrl?: string | null;
  } | null;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  institution_id?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  teachers?: DepartmentTeacher[];
  _count?: {
    teachers: number;
    subjects: number;
  };
}

export interface CreateDepartmentInput {
  name: string;
  code: string;
  teacher_ids?: string[];
}

export interface UpdateDepartmentInput {
  name?: string;
  code?: string;
  teacher_ids?: string[];
}

export interface DepartmentPaginationMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

export interface DepartmentListResponse {
  data: Department[];
  meta: DepartmentPaginationMeta;
}

export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
  meta?: DepartmentPaginationMeta;
}
