import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createExaminationApi, deleteExaminationApi, getExaminationStatsApi, getExaminationsApi, updateExaminationApi } from "../api/examinations";
import type { ExaminationFilters, ExaminationInput } from "../types";

export const EXAMINATIONS_QUERY_KEY = ["examinations"] as const;

export function useExaminations(params: ExaminationFilters, enabled = true) {
  return useQuery({ queryKey: [...EXAMINATIONS_QUERY_KEY, params], queryFn: () => getExaminationsApi(params), placeholderData: (previous) => previous, enabled });
}

export function useExaminationStats() {
  return useQuery({ queryKey: [...EXAMINATIONS_QUERY_KEY, "stats"], queryFn: getExaminationStatsApi });
}

export function useCreateExamination() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (input: ExaminationInput) => createExaminationApi(input), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: EXAMINATIONS_QUERY_KEY }); void queryClient.invalidateQueries({ queryKey: [...EXAMINATIONS_QUERY_KEY, "stats"] }); } });
}

export function useUpdateExamination() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, input }: { id: string; input: Partial<ExaminationInput> }) => updateExaminationApi(id, input), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: EXAMINATIONS_QUERY_KEY }); void queryClient.invalidateQueries({ queryKey: [...EXAMINATIONS_QUERY_KEY, "stats"] }); } });
}

export function useDeleteExamination() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => deleteExaminationApi(id), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: EXAMINATIONS_QUERY_KEY }); void queryClient.invalidateQueries({ queryKey: [...EXAMINATIONS_QUERY_KEY, "stats"] }); } });
}
