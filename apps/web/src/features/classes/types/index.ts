export interface ClassItem {
  id: string;
  institution_id: string;
  homeroom_teacher_id?: string | null;
  academic_year_id: string;
  name: string;
  grade_level: number;
  capacity?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClassInput {
  institution_id: string;
  homeroom_teacher_id?: string | null;
  academic_year_id: string;
  name: string;
  grade_level: number;
  capacity?: number | null;
}

export interface UpdateClassInput {
  institution_id?: string;
  homeroom_teacher_id?: string | null;
  academic_year_id?: string;
  name?: string;
  grade_level?: number;
  capacity?: number | null;
}

export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T | null;
  meta?: { total?: number; page?: number; limit?: number };
}