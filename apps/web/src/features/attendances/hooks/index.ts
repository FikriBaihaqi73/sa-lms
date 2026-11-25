import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	bulkUpsertAttendance,
	deleteAttendance,
	getAcademicYearsOptions,
	getAttendanceStatusesOptions,
	getAttendanceSummary,
	getAttendances,
	getClassesOptions,
	getClassStudentsOptions,
	getSchedulesOptions,
	upsertAttendance,
} from "../api";
import type {
	AttendanceFilters,
	BulkUpsertAttendanceInput,
	UpsertAttendanceInput,
} from "../types";

export const ATTENDANCES_QUERY_KEY = ["attendances"] as const;

export function useAttendances(params: AttendanceFilters = {}) {
	return useQuery({
		queryKey: [...ATTENDANCES_QUERY_KEY, "list", params],
		queryFn: () => getAttendances(params),
	});
}

export function useAttendanceSummary(params: AttendanceFilters = {}) {
	return useQuery({
		queryKey: [...ATTENDANCES_QUERY_KEY, "summary", params],
		queryFn: () => getAttendanceSummary(params),
	});
}

export function useUpsertAttendance() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: UpsertAttendanceInput) => upsertAttendance(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ATTENDANCES_QUERY_KEY });
		},
	});
}

export function useBulkUpsertAttendance() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: BulkUpsertAttendanceInput) =>
			bulkUpsertAttendance(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ATTENDANCES_QUERY_KEY });
		},
	});
}

export function useDeleteAttendance() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteAttendance(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ATTENDANCES_QUERY_KEY });
		},
	});
}

export function useClassesOptions() {
	return useQuery({
		queryKey: ["classes", "options-lookup"],
		queryFn: () => getClassesOptions(),
		staleTime: 5 * 60 * 1000,
	});
}

export function useSchedulesOptions(classId?: string) {
	return useQuery({
		queryKey: ["schedules", "options-lookup", classId ?? "all"],
		queryFn: () => getSchedulesOptions(classId),
		staleTime: 5 * 60 * 1000,
	});
}

export function useAttendanceStatusesOptions() {
	return useQuery({
		queryKey: ["attendance-statuses", "options-lookup"],
		queryFn: () => getAttendanceStatusesOptions(),
		staleTime: 10 * 60 * 1000,
	});
}

export function useAcademicYearsOptions() {
	return useQuery({
		queryKey: ["academic-years", "options-lookup"],
		queryFn: () => getAcademicYearsOptions(),
		staleTime: 10 * 60 * 1000,
	});
}

export function useClassStudents(classId?: string) {
	return useQuery({
		queryKey: ["class-students", "lookup", classId ?? "all"],
		queryFn: () => getClassStudentsOptions(classId),
		staleTime: 2 * 60 * 1000,
	});
}
