import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createStudyPlanApi,
	deleteStudyPlanApi,
	getAcademicYearsOptionsApi,
	getClassSubjectsOptionsApi,
	getDepartmentsOptionsApi,
	getStudentsOptionsApi,
	getStudyPlanByIdApi,
	getStudyPlansApi,
	updateStudyPlanApi,
} from "../api";
import type {
	CreateStudyPlanInput,
	StudyPlanFilters,
	UpdateStudyPlanInput,
} from "../types";

export const STUDY_PLANS_QUERY_KEY = ["study-plans"] as const;

export function useStudyPlans(filters: StudyPlanFilters = {}) {
	return useQuery({
		queryKey: [
			...STUDY_PLANS_QUERY_KEY,
			{
				page: filters.page ?? 1,
				limit: filters.limit ?? 10,
				search: filters.search ?? "",
				student_id: filters.student_id ?? "",
				class_subject_id: filters.class_subject_id ?? "",
				academic_year_id: filters.academic_year_id ?? "",
				department_id: filters.department_id ?? "",
			},
		],
		queryFn: () => getStudyPlansApi(filters),
		placeholderData: (previousData) => previousData,
	});
}

export function useStudyPlan(id: string) {
	return useQuery({
		queryKey: [...STUDY_PLANS_QUERY_KEY, id],
		queryFn: () => getStudyPlanByIdApi(id),
		enabled: Boolean(id),
	});
}

export function useCreateStudyPlan() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateStudyPlanInput) => createStudyPlanApi(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: STUDY_PLANS_QUERY_KEY });
		},
	});
}

export function useUpdateStudyPlan() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateStudyPlanInput }) =>
			updateStudyPlanApi(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: STUDY_PLANS_QUERY_KEY });
		},
	});
}

export function useDeleteStudyPlan() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteStudyPlanApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: STUDY_PLANS_QUERY_KEY });
		},
	});
}

export function useStudentsOptions() {
	return useQuery({
		queryKey: ["students", "options", "study-plans"],
		queryFn: getStudentsOptionsApi,
		staleTime: 60000,
	});
}

export function useClassSubjectsOptions() {
	return useQuery({
		queryKey: ["class-subjects", "options", "study-plans"],
		queryFn: getClassSubjectsOptionsApi,
		staleTime: 60000,
	});
}

export function useAcademicYearsOptions() {
	return useQuery({
		queryKey: ["academic-years", "options", "study-plans"],
		queryFn: getAcademicYearsOptionsApi,
		staleTime: 60000,
	});
}

export function useDepartmentsOptions() {
	return useQuery({
		queryKey: ["departments", "options", "study-plans"],
		queryFn: getDepartmentsOptionsApi,
		staleTime: 60000,
	});
}
