import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDepartmentApi,
  deleteDepartmentApi,
  getDepartmentByIdApi,
  getDepartmentsApi,
  type GetDepartmentsParams,
  updateDepartmentApi,
} from "../api/departments";
import type { CreateDepartmentInput, UpdateDepartmentInput } from "../types";

export const DEPARTMENTS_QUERY_KEY = ["departments"] as const;

export const useDepartments = (params?: GetDepartmentsParams) => {
  return useQuery({
    queryKey: [
      ...DEPARTMENTS_QUERY_KEY,
      params?.page ?? 1,
      params?.limit ?? 10,
      params?.search ?? "",
    ],
    queryFn: () => getDepartmentsApi(params),
    placeholderData: (prev) => prev,
  });
};

export const useDepartment = (id: string, enabled = true) => {
  return useQuery({
    queryKey: [...DEPARTMENTS_QUERY_KEY, "detail", id],
    queryFn: () => getDepartmentByIdApi(id),
    enabled: enabled && Boolean(id),
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDepartmentInput) => createDepartmentApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDepartmentInput }) =>
      updateDepartmentApi(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDepartmentApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
};
