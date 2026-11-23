import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createExaminationScoreApi,
	deleteExaminationScoreApi,
	getAcademicYearsApi,
	getClassesApi,
	getClassStudentsApi,
	getExaminationScoresByExamApi,
	getExaminationsApi,
	getGradesApi,
	updateExaminationScoreApi,
} from "../api/examination-scores";
import type { CreateScoreInput, UpdateScoreInput } from "../types";

export const EXAMINATION_SCORES_QUERY_KEY = ["examination-scores"] as const;
export const EXAMINATIONS_QUERY_KEY = ["examinations-lookup"] as const;
export const CLASS_STUDENTS_QUERY_KEY = ["class-students-lookup"] as const;
export const GRADES_LOOKUP_QUERY_KEY = ["grades"] as const;

export function useAcademicYears() {
	return useQuery({
		queryKey: ["academic-years-lookup"],
		queryFn: getAcademicYearsApi,
		staleTime: 5 * 60 * 1000,
	});
}

export function useClasses(academicYearId?: string) {
	return useQuery({
		queryKey: ["classes-lookup", academicYearId ?? "all"],
		queryFn: () => getClassesApi(academicYearId),
		staleTime: 5 * 60 * 1000,
	});
}

export function useExaminations() {
	return useQuery({
		queryKey: EXAMINATIONS_QUERY_KEY,
		queryFn: getExaminationsApi,
		staleTime: 2 * 60 * 1000,
	});
}

export function useClassStudents(classId?: string) {
	return useQuery({
		queryKey: [...CLASS_STUDENTS_QUERY_KEY, classId ?? ""],
		queryFn: () =>
			classId ? getClassStudentsApi(classId) : Promise.resolve([]),
		enabled: Boolean(classId),
		staleTime: 2 * 60 * 1000,
	});
}

export function useExaminationScores(examinationId?: string) {
	return useQuery({
		queryKey: [...EXAMINATION_SCORES_QUERY_KEY, examinationId ?? ""],
		queryFn: () =>
			examinationId
				? getExaminationScoresByExamApi(examinationId)
				: Promise.resolve([]),
		enabled: Boolean(examinationId),
	});
}

export function useGradesLookup() {
	return useQuery({
		queryKey: GRADES_LOOKUP_QUERY_KEY,
		queryFn: getGradesApi,
		staleTime: 5 * 60 * 1000,
	});
}

export function useCreateScore() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateScoreInput) => createExaminationScoreApi(input),
		onSuccess: (_, vars) => {
			queryClient.invalidateQueries({
				queryKey: [...EXAMINATION_SCORES_QUERY_KEY, vars.examinationId],
			});
			queryClient.invalidateQueries({ queryKey: EXAMINATIONS_QUERY_KEY });
		},
	});
}

export function useUpdateScore() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateScoreInput }) =>
			updateExaminationScoreApi(id, input),
		onSuccess: (_, vars) => {
			if (vars.input.examinationId) {
				queryClient.invalidateQueries({
					queryKey: [...EXAMINATION_SCORES_QUERY_KEY, vars.input.examinationId],
				});
			} else {
				queryClient.invalidateQueries({
					queryKey: EXAMINATION_SCORES_QUERY_KEY,
				});
			}
			queryClient.invalidateQueries({ queryKey: EXAMINATIONS_QUERY_KEY });
		},
	});
}

export function useDeleteScore() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id }: { id: string; examinationId: string }) =>
			deleteExaminationScoreApi(id),
		onSuccess: (_, vars) => {
			queryClient.invalidateQueries({
				queryKey: [...EXAMINATION_SCORES_QUERY_KEY, vars.examinationId],
			});
			queryClient.invalidateQueries({ queryKey: EXAMINATIONS_QUERY_KEY });
		},
	});
}
