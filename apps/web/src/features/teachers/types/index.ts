export interface TeacherProfileUser {
  id: string;
  email: string;
  is_active: boolean;
}

export interface TeacherProfile {
  id: string;
  fullName: string;
  email?: string | null;
  phoneNumber?: string | null;
  userId: string | null;
  users?: TeacherProfileUser | null;
}

export interface Teacher {
  id: string;
  profile_id: string;
  specialization_id?: string | null;
  employment_status_id?: string | null;
  teacher_number: string;
  join_date?: string | null;
  created_at: string;
  updated_at: string;
  profile?: TeacherProfile | null;
  employment_status?: { id: string; name: string } | null;
  specialization?: { id: string; name: string } | null;
  _count?: { classSubjects: number };
}

export interface TeacherPageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TeacherListResult {
  data: Teacher[];
  meta: TeacherPageMeta;
}

export interface TeacherStats {
  total: number;
  tetapCount: number;
  honorerCount: number;
  specializationCount: number;
  totalClassAssignments: number;
  unassignedCount: number;
}

export interface TeacherFormProfile {
  id: string;
  fullName: string;
  email?: string | null;
}

export interface TeacherReference {
  id: string;
  name: string;
}

export interface TeacherClassAssignment {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  academic_year_id: string;
  class?: { id: string; name: string } | null;
  subject?: { id: string; name: string; code?: string | null } | null;
}

export interface CreateTeacherInput {
  profile_id: string;
  teacher_number: string;
  specialization_id?: string;
  employment_status_id?: string;
  join_date?: string;
}

export interface UpdateTeacherInput {
  teacher_number?: string;
  specialization_id?: string | null;
  employment_status_id?: string | null;
  join_date?: string | null;
}
