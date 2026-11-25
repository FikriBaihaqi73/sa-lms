import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createAttendanceSchedule,
	deleteAttendanceSchedule,
	getAcademicYearsForAttendanceSchedules,
	getAttendanceSchedules,
	getClassesForAttendanceSchedules,
	getSchedulesForAttendanceSchedules,
	toggleAttendanceScheduleStatus,
	type UpsertAttendanceSchedulePayload,
	updateAttendanceSchedule,
	updateAttendanceScheduleDays,
} from "../api";
import type { AttendanceDay, AttendanceScheduleFilters } from "../types";

export const attendanceScheduleKeys = {
	all: ["attendance-schedules"] as const,
	list: (filters: AttendanceScheduleFilters) =>
		["attendance-schedules", "list", filters] as const,
	academicYears: ["attendance-schedules", "academic-years"] as const,
	classes: ["attendance-schedules", "classes"] as const,
	schedules: ["attendance-schedules", "schedules"] as const,
};

export function useAttendanceSchedules(filters: AttendanceScheduleFilters) {
	return useQuery({
		queryKey: attendanceScheduleKeys.list(filters),
		queryFn: () => getAttendanceSchedules(filters),
	});
}

export function useAttendanceScheduleAcademicYears() {
	return useQuery({
		queryKey: attendanceScheduleKeys.academicYears,
		queryFn: getAcademicYearsForAttendanceSchedules,
	});
}

export function useAttendanceScheduleClasses() {
	return useQuery({
		queryKey: attendanceScheduleKeys.classes,
		queryFn: getClassesForAttendanceSchedules,
	});
}

export function useAttendanceScheduleOptions() {
	return useQuery({
		queryKey: attendanceScheduleKeys.schedules,
		queryFn: getSchedulesForAttendanceSchedules,
	});
}

export function useCreateAttendanceSchedule() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpsertAttendanceSchedulePayload) =>
			createAttendanceSchedule(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceScheduleKeys.all });
		},
	});
}

export function useUpdateAttendanceSchedule() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: Partial<UpsertAttendanceSchedulePayload>;
		}) => updateAttendanceSchedule(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceScheduleKeys.all });
		},
	});
}

export function useToggleAttendanceScheduleStatus() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
			toggleAttendanceScheduleStatus(id, isActive),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceScheduleKeys.all });
		},
	});
}

export function useUpdateAttendanceScheduleDays() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			activeDays,
		}: {
			id: string;
			activeDays: AttendanceDay[];
		}) => updateAttendanceScheduleDays(id, activeDays),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceScheduleKeys.all });
		},
	});
}

export function useDeleteAttendanceSchedule() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteAttendanceSchedule(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: attendanceScheduleKeys.all });
		},
	});
}
