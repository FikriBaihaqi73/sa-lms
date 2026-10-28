import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllClassSubjectOptionsApi, getClassSubjectsApi, createClassSubjectApi, deleteClassSubjectApi, updateClassSubjectApi } from "../api/classSubjects";
import type { ClassSubjectFilters, ClassSubjectInput } from "../types";
import { classSubjectsQueryKey } from "../utils";

export const CLASS_SUBJECTS_QUERY_KEY = ["class-subjects"] as const;
export const CLASS_SUBJECT_OPTIONS_QUERY_KEY = ["class-subjects", "options"] as const;

export function useClassSubjects(params: ClassSubjectFilters) {
  return useQuery({ queryKey: classSubjectsQueryKey(params), queryFn: () => getClassSubjectsApi(params), placeholderData: (previous) => previous });
}

export function useClassSubjectOptions() {
  return useQuery({ queryKey: CLASS_SUBJECT_OPTIONS_QUERY_KEY, queryFn: getAllClassSubjectOptionsApi, staleTime: 5 * 60 * 1000 });
}

export function useCreateClassSubject() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (input: ClassSubjectInput) => createClassSubjectApi(input), onSuccess: () => queryClient.invalidateQueries({ queryKey: CLASS_SUBJECTS_QUERY_KEY }) });
}

export function useUpdateClassSubject() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, input }: { id: string; input: Partial<ClassSubjectInput> }) => updateClassSubjectApi(id, input), onSuccess: () => queryClient.invalidateQueries({ queryKey: CLASS_SUBJECTS_QUERY_KEY }) });
}

export function useDeleteClassSubject() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => deleteClassSubjectApi(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: CLASS_SUBJECTS_QUERY_KEY }) });
}
