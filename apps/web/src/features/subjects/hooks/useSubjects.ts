import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSubjectApi, deleteSubjectApi, getSubjectsApi, updateSubjectApi } from "../api/subjects";
import type { CreateSubjectInput, SubjectQuery, UpdateSubjectInput } from "../types";

export const SUBJECTS_QUERY_KEY = ["subjects"] as const;

export function useSubjects(query: SubjectQuery) {
	return useQuery({
		queryKey: [...SUBJECTS_QUERY_KEY, query.page, query.limit, query.search ?? ""],
		queryFn: () => getSubjectsApi(query),
		placeholderData: (previous) => previous,
	});
}

export function useCreateSubject() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateSubjectInput) => createSubjectApi(input),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY }),
	});
}

export function useUpdateSubject() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateSubjectInput }) => updateSubjectApi(id, input),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY }),
	});
}

export function useDeleteSubject() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteSubjectApi(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: SUBJECTS_QUERY_KEY }),
	});
}
