export type SpecializationStatusType = 'system' | 'dikti' | 'custom';
export type BadgeTone = 'blue' | 'red' | 'gray' | 'amber';

export interface AccessCell {
  enabled: boolean;
  note?: string;
}

export interface SpecializationStatusAccess {
  krs: AccessCell;
  lms: AccessCell;
  prs: AccessCell;
}

export interface SpecializationStatus {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // Field di bawah belum ada di backend, diisi data mock (lihat data/mockSpecializationStatuses.ts)
  code?: string;
  badgeTone?: BadgeTone;
  access?: SpecializationStatusAccess;
  billing?: string;
  billingSpecial?: boolean;
  studyCounted?: boolean;
  studyLabel?: string;
  pddikti?: string;
  type?: SpecializationStatusType;
}

export interface CreateSpecializationStatusInput {
  name: string;
  description?: string;
}

export interface UpdateSpecializationStatusInput {
  name?: string;
  description?: string;
}

export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
}
