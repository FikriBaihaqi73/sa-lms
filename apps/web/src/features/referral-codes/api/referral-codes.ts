import { apiFetch } from "@/lib/api";
import type {
  CreateReferralCodeInput,
  GetReferralCodesParams,
  ReferralCode,
  ReferralCodeListResult,
  UpdateReferralCodeInput,
} from "../types";

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
  code?: number;
}

const emptyPage = (page = 1, limit = 10): ReferralCodeListResult => ({
  data: [],
  meta: { page, limit, total: 0, totalPages: 0 },
});

export const getReferralCodesApi = async (
  params: GetReferralCodesParams = {},
): Promise<ReferralCodeListResult> => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.status && params.status !== "all") query.set("status", params.status);
  if (params.departmentId) query.set("departmentId", params.departmentId);
  if (params.enrollmentYear) query.set("enrollmentYear", String(params.enrollmentYear));

  const response: ApiResponse<ReferralCodeListResult> = await apiFetch(
    `/referral-codes?${query.toString()}`,
  );
  return response.data ?? emptyPage(params.page, params.limit);
};

export const getReferralCodeByIdApi = async (id: string): Promise<ReferralCode> => {
  const response: ApiResponse<ReferralCode> = await apiFetch(`/referral-codes/${id}`);
  return response.data;
};

export const createReferralCodeApi = async (
  input: CreateReferralCodeInput,
): Promise<ReferralCode> => {
  const response: ApiResponse<ReferralCode> = await apiFetch("/referral-codes", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
};

export const updateReferralCodeApi = async (
  id: string,
  input: UpdateReferralCodeInput,
): Promise<ReferralCode> => {
  const response: ApiResponse<ReferralCode> = await apiFetch(`/referral-codes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return response.data;
};

export const toggleActiveReferralCodeApi = async (
  id: string,
): Promise<ReferralCode> => {
  const response: ApiResponse<ReferralCode> = await apiFetch(
    `/referral-codes/${id}/toggle`,
    {
      method: "PATCH",
    },
  );
  return response.data;
};

export const deleteReferralCodeApi = async (id: string): Promise<ReferralCode> => {
  const response: ApiResponse<ReferralCode> = await apiFetch(
    `/referral-codes/${id}`,
    {
      method: "DELETE",
    },
  );
  return response.data;
};

export const getReferralDepartmentsApi = async (): Promise<
  import("../types").ReferralCodeDepartment[]
> => {
  const response = (await apiFetch("/departments?page=1&limit=100")) as {
    data?:
      | import("../types").ReferralCodeDepartment[]
      | { data?: import("../types").ReferralCodeDepartment[] };
  };
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }
  return [];
};
