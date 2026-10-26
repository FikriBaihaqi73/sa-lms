import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	batchCreateClassStudentsApi,
	batchDeleteClassStudentsApi,
	deleteClassStudentApi,
	getCandidateStudentsApi,
	getClassesOptionsApi,
	getClassStudentsApi,
	getClassStudentsSummaryApi,
	restoreClassStudentApi,
} from "../api/class-students";
import type {
	BatchCreateClassStudentsInput,
	GetClassStudentsParams,
} from "../types";

export function useClassStudents(params: GetClassStudentsParams = {}) {
	return useQuery({
		queryKey: [
			"class-students",
			{
				status: params.status ?? "active",
				classId: params.classId ?? "",
				search: params.search ?? "",
				page: params.page ?? 1,
				limit: params.limit ?? 10,
			},
		],
		queryFn: () => getClassStudentsApi(params),
		placeholderData: (previousData) => previousData,
	});
}

export function useClassStudentsSummary(classId?: string) {
	return useQuery({
		queryKey: ["class-students", "summary", { classId: classId ?? "" }],
		queryFn: () => getClassStudentsSummaryApi(classId),
		retry: false,
		staleTime: 30000,
	});
}

export function useCandidateStudents(classId: string, enabled: boolean) {
	return useQuery({
		queryKey: ["class-students", "candidates", { classId }],
		queryFn: () => getCandidateStudentsApi(classId),
		enabled: enabled && Boolean(classId),
		staleTime: 10000,
	});
}

export function useClassesOptions() {
	return useQuery({
		queryKey: ["classes", "options"],
		queryFn: () => getClassesOptionsApi(),
		staleTime: 60000,
	});
}

export function useBatchCreateClassStudents() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: BatchCreateClassStudentsInput) =>
			batchCreateClassStudentsApi(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["class-students"] });
		},
	});
}

export function useDeleteClassStudent() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteClassStudentApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["class-students"] });
		},
	});
}

export function useBatchDeleteClassStudents() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (ids: string[]) => batchDeleteClassStudentsApi(ids),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["class-students"] });
		},
	});
}

export function useRestoreClassStudent() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => restoreClassStudentApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["class-students"] });
		},
	});
}
