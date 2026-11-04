import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listAcademicYearsApi } from "@/features/academic-years/api/academic-years";
import { getClassSubjectsApi } from "@/features/class-subject/api/classSubjects";
import { getStudentsApi } from "@/features/students/api/students";
import {
	createStudyPlanApi,
	deleteStudyPlanApi,
	getStudyPlanByIdApi,
	getStudyPlansApi,
	updateStudyPlanApi,
} from "../api";
import type {
	AcademicYearOption,
	ClassSubjectOption,
	CreateStudyPlanInput,
	StudentOption,
	StudyPlanFilters,
	UpdateStudyPlanInput,
} from "../types";

export function useStudyPlans(filters: StudyPlanFilters = {}) {
	return useQuery({
		queryKey: [
			"study-plans",
			{
				page: filters.page ?? 1,
				limit: filters.limit ?? 10,
				search: filters.search ?? "",
				student_id: filters.student_id ?? "",
				class_subject_id: filters.class_subject_id ?? "",
				academic_year_id: filters.academic_year_id ?? "",
			},
		],
		queryFn: () => getStudyPlansApi(filters),
		placeholderData: (previousData) => previousData,
	});
}

export function useStudyPlan(id: string) {
	return useQuery({
		queryKey: ["study-plans", id],
		queryFn: () => getStudyPlanByIdApi(id),
		enabled: Boolean(id),
	});
}

export function useCreateStudyPlan() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateStudyPlanInput) => createStudyPlanApi(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["study-plans"] });
		},
	});
}

export function useUpdateStudyPlan() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateStudyPlanInput }) =>
			updateStudyPlanApi(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["study-plans"] });
		},
	});
}

export function useDeleteStudyPlan() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteStudyPlanApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["study-plans"] });
		},
	});
}

export function useStudentsOptions() {
	return useQuery({
		queryKey: ["students", "options", "study-plans"],
		queryFn: async (): Promise<StudentOption[]> => {
			const res = await getStudentsApi({ page: 1, limit: 100 });
			const rawList = res?.data ?? [];
			return rawList.map((s) => ({
				id: s.id,
				studentNumber: s.studentNumber,
				fullName: s.profile?.fullName || `Siswa #${s.studentNumber}`,
			}));
		},
		staleTime: 60000,
	});
}

export function useClassSubjectsOptions() {
	return useQuery({
		queryKey: ["class-subjects", "options", "study-plans"],
		queryFn: async (): Promise<ClassSubjectOption[]> => {
			const res = await getClassSubjectsApi({ page: 1, limit: 100 });
			const rawList = res?.data ?? [];
			return rawList.map((cs) => ({
				id: cs.id,
				subjectName: cs.subject?.name || "Mata Pelajaran",
				subjectCode: (cs.subject as { code?: string | null })?.code ?? null,
				className: cs.class?.name || "Kelas",
				teacherName: cs.teacher?.profile?.fullName ?? null,
				academicYearName: cs.academic_year?.academic_year ?? null,
			}));
		},
		staleTime: 60000,
	});
}

export function useAcademicYearsOptions() {
	return useQuery({
		queryKey: ["academic-years", "options", "study-plans"],
		queryFn: async (): Promise<AcademicYearOption[]> => {
			const rawList = await listAcademicYearsApi();
			return (rawList ?? []).map((ay) => ({
				id: ay.id,
				academic_year: ay.academic_year,
				is_active: ay.is_active,
			}));
		},
		staleTime: 60000,
	});
}

