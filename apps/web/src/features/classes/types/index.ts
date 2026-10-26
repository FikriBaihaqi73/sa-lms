export interface ClassItem {
  id: string;
  institution_id: string;
  homeroom_teacher_id?: string | null;
  academic_year_id: string;
  name: string;
  grade_level: number;
  capacity?: number | null;
  created_at?: string;
  updated_at?: string;
  institution?: { id: string; name: string; shortName?: string | null } | null;
  academic_year?: { id: string; academic_year: string; is_active: boolean } | null;
  homeroom_teacher?: { id: string; teacher_number: string; profile_id?: string | null } | null;
  _count?: { classStudents: number };
}

export interface CreateClassInput {
  homeroom_teacher_id?: string;
  academic_year_id: string;
  name: string;
  grade_level: number;
}

export interface UpdateClassInput {
  homeroom_teacher_id?: string | null;
  academic_year_id?: string;
  name?: string;
  grade_level?: number;
}

export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T | null;
  meta?: { total?: number; page?: number; limit?: number; totalPages?: number };
}

export interface ClassListResult {
  data: ClassItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
