import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClassApi, deleteClassApi, getClassesApi, updateClassApi } from "../api/classes";
import type { CreateClassInput, UpdateClassInput } from "../types";

export const CLASSES_QUERY_KEY = ["classes"] as const;

export const useClasses = (params?: { page?: number; limit?: number; search?: string }) =>
  useQuery({ queryKey: [...CLASSES_QUERY_KEY, params], queryFn: () => getClassesApi(params) });

export const useCreateClass = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (input: CreateClassInput) => createClassApi(input), onSuccess: () => qc.invalidateQueries({ queryKey: CLASSES_QUERY_KEY }) });
};

export const useUpdateClass = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, input }: { id: string; input: UpdateClassInput }) => updateClassApi(id, input), onSuccess: () => qc.invalidateQueries({ queryKey: CLASSES_QUERY_KEY }) });
};

export const useDeleteClass = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => deleteClassApi(id), onSuccess: () => qc.invalidateQueries({ queryKey: CLASSES_QUERY_KEY }) });
};