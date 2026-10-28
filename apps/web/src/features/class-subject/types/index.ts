export interface ClassSubject {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  academic_year_id: string;
  class: { id: string; name: string } | null;
  subject: { id: string; name: string } | null;
  teacher: {
    id: string;
    teacher_number: string;
    profile: { fullName: string } | null;
  } | null;
  academic_year: { id: string; academic_year: string; is_active: boolean; institution_id: string | null } | null;
}

export interface ClassSubjectListResponse {
  status: "success";
  message: string;
  data: ClassSubject[];
  code: number;
  meta: {
    totalData: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}

export interface ClassSubjectListResult {
  data: ClassSubject[];
  meta: ClassSubjectListResponse["meta"];
}

export interface ClassSubjectInput {
  class_id: string;
  subject_id: string;
  teacher_id: string;
  academic_year_id: string;
}

export interface ClassSubjectOptions {
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  teachers: { id: string; teacher_number: string; profile: { fullName: string } | null }[];
  academicYears: { id: string; academic_year: string; is_active: boolean; institution_id: string | null }[];
}

export interface ClassSubjectFilters {
  page?: number;
  limit?: number;
  search?: string;
  class_id?: string;
  academic_year_id?: string;
  teacher_id?: string;
}
