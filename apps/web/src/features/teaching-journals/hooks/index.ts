import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import {
	createTeachingJournal,
	deleteTeachingJournal,
	getTeachingJournalById,
	getTeachingJournals,
	updateTeachingJournal,
} from "../api";
import type {
	CreateTeachingJournalInput,
	ScheduleOption,
	TeachingJournalParams,
	UpdateTeachingJournalInput,
} from "../types";

export const TEACHING_JOURNALS_QUERY_KEY = ["teaching-journals"] as const;

export function useTeachingJournals(params: TeachingJournalParams = {}) {
	return useQuery({
		queryKey: [...TEACHING_JOURNALS_QUERY_KEY, params],
		queryFn: () => getTeachingJournals(params),
	});
}

export function useTeachingJournal(id: string | null) {
	return useQuery({
		queryKey: [...TEACHING_JOURNALS_QUERY_KEY, "detail", id],
		queryFn: () => {
			if (!id) throw new Error("Journal ID is required");
			return getTeachingJournalById(id);
		},
		enabled: Boolean(id),
	});
}

export function useCreateTeachingJournal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateTeachingJournalInput) =>
			createTeachingJournal(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: TEACHING_JOURNALS_QUERY_KEY });
		},
	});
}

export function useUpdateTeachingJournal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: UpdateTeachingJournalInput;
		}) => updateTeachingJournal(id, data),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: TEACHING_JOURNALS_QUERY_KEY });
			queryClient.invalidateQueries({
				queryKey: [...TEACHING_JOURNALS_QUERY_KEY, "detail", variables.id],
			});
		},
	});
}

export function useDeleteTeachingJournal() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteTeachingJournal(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: TEACHING_JOURNALS_QUERY_KEY });
		},
	});
}

interface RawScheduleApiItem {
	id: string;
	day: string;
	startTime?: string | null;
	endTime?: string | null;
	classroom?: {
		id: string;
		roomCode: string;
		roomName: string;
	} | null;
	classSubject?: {
		id: string;
		class?: {
			id: string;
			name: string;
		} | null;
		subject?: {
			id: string;
			name: string;
			code?: string | null;
		} | null;
		teacher?: {
			id: string;
			teacher_number?: string | null;
			profile?: {
				id: string;
				fullName: string;
			} | null;
		} | null;
	} | null;
}

export function useSchedulesOptions() {
	return useQuery<ScheduleOption[]>({
		queryKey: ["schedules", "options-lookup"],
		queryFn: async () => {
			try {
				const response = (await apiFetch("/schedules?page=1&limit=100")) as {
					data?: RawScheduleApiItem[];
				};
				const items = Array.isArray(response?.data) ? response.data : [];

				return items.map((sch) => {
					const className = sch.classSubject?.class?.name ?? "Kelas";
					const subjectName =
						sch.classSubject?.subject?.name ?? "Mata Pelajaran";
					const teacherName =
						sch.classSubject?.teacher?.profile?.fullName ??
						(sch.classSubject?.teacher?.teacher_number
							? `Guru (${sch.classSubject.teacher.teacher_number})`
							: "Pengajar");
					const roomName =
						sch.classroom?.roomName ?? sch.classroom?.roomCode ?? "";
					const timeRange =
						sch.startTime && sch.endTime
							? `${sch.startTime} - ${sch.endTime}`
							: "";

					// Format: "[Nama Kelas] - [Nama Mapel] (Guru Pengampu)"
					const label = `${className} - ${subjectName} (${teacherName})`;

					return {
						id: sch.id,
						label,
						day: sch.day,
						className,
						subjectName,
						teacherName,
						roomName,
						timeRange,
					};
				});
			} catch {
				return [];
			}
		},
		staleTime: 60_000,
	});
}
