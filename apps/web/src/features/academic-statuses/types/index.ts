export type AcademicStatusType = 'system' | 'dikti' | 'custom';
export type BadgeTone = 'blue' | 'red' | 'gray' | 'amber';

export interface AccessCell {
  enabled: boolean;
  note?: string;
}

export interface AcademicStatusAccess {
  krs: AccessCell;
  lms: AccessCell;
  prs: AccessCell;
}

export interface AcademicStatus {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // Field di bawah belum ada di backend, diisi data mock (lihat data/mockAcademicStatuses.ts)
  code?: string;
  badgeTone?: BadgeTone;
  access?: AcademicStatusAccess;
  billing?: string;
  billingSpecial?: boolean;
  studyCounted?: boolean;
  studyLabel?: string;
  pddikti?: string;
  type?: AcademicStatusType;
}

export interface CreateAcademicStatusInput {
  name: string;
  description?: string;
}

export interface UpdateAcademicStatusInput {
  name?: string;
  description?: string;
}

export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
}
