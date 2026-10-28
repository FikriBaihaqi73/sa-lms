import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createReferralCodeApi,
  deleteReferralCodeApi,
  getReferralCodeByIdApi,
  getReferralCodesApi,
  getReferralDepartmentsApi,
  toggleActiveReferralCodeApi,
  updateReferralCodeApi,
} from "../api/referral-codes";
import type {
  CreateReferralCodeInput,
  GetReferralCodesParams,
  UpdateReferralCodeInput,
} from "../types";

export const REFERRAL_CODES_QUERY_KEY = ["referral-codes"] as const;

export const useReferralCodes = (params: GetReferralCodesParams = {}) =>
  useQuery({
    queryKey: [
      ...REFERRAL_CODES_QUERY_KEY,
      params.page ?? 1,
      params.limit ?? 10,
      params.search ?? "",
      params.status ?? "all",
      params.departmentId ?? "",
      params.enrollmentYear ?? "",
    ],
    queryFn: () => getReferralCodesApi(params),
    placeholderData: (previousData) => previousData,
  });

export const useReferralCode = (id?: string) =>
  useQuery({
    queryKey: [...REFERRAL_CODES_QUERY_KEY, "detail", id],
    queryFn: () => getReferralCodeByIdApi(id as string),
    enabled: Boolean(id),
  });

export const useCreateReferralCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReferralCodeInput) => createReferralCodeApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REFERRAL_CODES_QUERY_KEY });
    },
  });
};

export const useUpdateReferralCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateReferralCodeInput;
    }) => updateReferralCodeApi(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REFERRAL_CODES_QUERY_KEY });
    },
  });
};

export const useToggleActiveReferralCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleActiveReferralCodeApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REFERRAL_CODES_QUERY_KEY });
    },
  });
};

export const useDeleteReferralCode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReferralCodeApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REFERRAL_CODES_QUERY_KEY });
    },
  });
};

export const REFERRAL_DEPARTMENTS_QUERY_KEY = [
  "referral-form-departments",
] as const;

export const useReferralDepartments = () =>
  useQuery({
    queryKey: REFERRAL_DEPARTMENTS_QUERY_KEY,
    queryFn: getReferralDepartmentsApi,
    staleTime: 5 * 60 * 1000,
  });

