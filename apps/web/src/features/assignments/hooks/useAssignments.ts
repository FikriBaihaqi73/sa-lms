import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createAssignmentApi,
	deleteAssignmentApi,
	getAcademicYearsOptionsApi,
	getAssignmentByIdApi,
	getAssignmentSubmissionsApi,
	getAssignmentsApi,
	getAssignmentTypesOptionsApi,
	getClassesOptionsApi,
	getClassStudentsOptionsApi,
	getModulesOptionsApi,
	updateAssignmentApi,
} from "../api/assignments";
import type {
	AssignmentFilters,
	CreateAssignmentPayload,
	UpdateAssignmentPayload,
} from "../types";

export const ASSIGNMENTS_QUERY_KEY = ["assignments"] as const;
export const ASSIGNMENT_SUBMISSIONS_QUERY_KEY = [
	"assignment-submissions",
] as const;

export function useAssignments(filters: AssignmentFilters = {}) {
	return useQuery({
		queryKey: [...ASSIGNMENTS_QUERY_KEY, filters],
		queryFn: () => getAssignmentsApi(filters),
	});
}

export function useAssignment(id: string) {
	return useQuery({
		queryKey: [...ASSIGNMENTS_QUERY_KEY, "detail", id],
		queryFn: () => getAssignmentByIdApi(id),
		enabled: Boolean(id),
	});
}

export function useAssignmentSubmissions(
	params: { assignmentId?: string; search?: string } = {},
) {
	return useQuery({
		queryKey: [...ASSIGNMENT_SUBMISSIONS_QUERY_KEY, params],
		queryFn: () => getAssignmentSubmissionsApi(params),
	});
}

export function useAssignmentTypesOptions() {
	return useQuery({
		queryKey: ["assignment-types", "options"],
		queryFn: getAssignmentTypesOptionsApi,
		staleTime: 5 * 60 * 1000,
	});
}

export function useModulesOptions() {
	return useQuery({
		queryKey: ["modules", "options"],
		queryFn: getModulesOptionsApi,
		staleTime: 5 * 60 * 1000,
	});
}

export function useClassesOptions(academicYearId?: string) {
	return useQuery({
		queryKey: ["classes", "options", academicYearId],
		queryFn: () => getClassesOptionsApi(academicYearId),
		staleTime: 5 * 60 * 1000,
	});
}

export function useAcademicYearsOptions() {
	return useQuery({
		queryKey: ["academic-years", "options"],
		queryFn: getAcademicYearsOptionsApi,
		staleTime: 5 * 60 * 1000,
	});
}

export function useClassStudentsOptions(classId?: string) {
	return useQuery({
		queryKey: ["class-students", "options", classId],
		queryFn: () => getClassStudentsOptionsApi(classId),
	});
}

export function useCreateAssignment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateAssignmentPayload) =>
			createAssignmentApi(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY });
		},
	});
}

export function useUpdateAssignment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: UpdateAssignmentPayload;
		}) => updateAssignmentApi(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY });
		},
	});
}

export function useDeleteAssignment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteAssignmentApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY });
		},
	});
}
