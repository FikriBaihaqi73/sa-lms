export interface StudentProfile {
  id: string;
  fullName: string;
  identityNumber?: string | null;
  email?: string | null;
  gender?: string | null;
  birthPlace?: string | null;
  birthDate?: string | null;
  religionId?: string | null;
  nationalityId?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  photoUrl?: string | null;
  institution?: {
    id: string;
    name: string;
    shortName?: string | null;
  } | null;
  role?: {
    id: string;
    name: string;
  } | null;
}

export interface Student {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  profileId: string;
  departmentId?: string | null;
  academicStatusId: string;
  studentNumber: string;
  enrollmentYear?: number | null;
  profile?: StudentProfile | null;
}

export interface StudentPageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StudentListResult {
  data: Student[];
  meta: StudentPageMeta;
}

export interface CreateStudentInput {
  profileId: string;
  departmentId?: string;
  academicStatusId: string;
  studentNumber: string;
  enrollmentYear?: number;
}

export interface UpdateStudentInput {
  departmentId?: string;
  academicStatusId?: string;
  studentNumber?: string;
  enrollmentYear?: number;
}

export interface StudentProfileListResult {
  data: StudentProfile[];
  meta: StudentPageMeta;
}

export interface StudentDepartment {
  id: string;
  name: string;
  code?: string | null;
}

export interface StudentDepartmentListResult {
  data: StudentDepartment[];
  meta: {
    totalData: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}

