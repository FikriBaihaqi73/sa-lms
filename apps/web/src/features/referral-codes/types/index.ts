export interface ReferralCodeDepartment {
  id: string;
  name: string;
  code?: string | null;
}

export interface ReferralCodeInstitution {
  id: string;
  name: string;
}

export interface ReferralCode {
  id: string;
  code: string;
  institution_id: string;
  usage_quota: number | null;
  used_count: number;
  enrollment_year: number | null;
  department_id: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  institution?: ReferralCodeInstitution | null;
  department?: ReferralCodeDepartment | null;
}

export interface ReferralCodePageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReferralCodeListResult {
  data: ReferralCode[];
  meta: ReferralCodePageMeta;
}

export interface CreateReferralCodeInput {
  code?: string;
  institutionId?: string;
  usageQuota?: number | null;
  enrollmentYear?: number | null;
  departmentId?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
}

export interface UpdateReferralCodeInput {
  usageQuota?: number | null;
  enrollmentYear?: number | null;
  departmentId?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
}

export interface GetReferralCodesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "active" | "inactive" | "expired" | "exhausted";
  departmentId?: string;
  enrollmentYear?: number;
}
