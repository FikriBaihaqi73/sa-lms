export interface StudentGuardianStudent {
  id: string;
  studentNumber: string;
  profile?: { fullName?: string | null; email?: string | null } | null;
}

export interface Guardian {
  id: string;
  fullName: string;
  relationship?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  institutionId?: string | null;
}

export interface StudentGuardian {
  id: string;
  studentId: string;
  guardianId: string;
  isPrimary: boolean;
  createdAt: string;
  student: StudentGuardianStudent;
  guardian: Guardian;
}

export interface StudentGuardianPageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StudentGuardianListResult {
  data: StudentGuardian[];
  meta: StudentGuardianPageMeta;
}

export interface StudentGuardianInput {
  studentId: string;
  guardianId: string;
  isPrimary: boolean;
}

export interface StudentGuardianOptionListResult {
  data: StudentGuardianStudent[];
  meta: StudentGuardianPageMeta;
}

export interface GuardianOptionListResult {
  data: Guardian[];
  meta: StudentGuardianPageMeta;
}

