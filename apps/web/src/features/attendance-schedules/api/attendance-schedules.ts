import { apiFetch } from "@/lib/api";
import type {
	AttendanceDay,
	AttendanceScheduleAcademicYear,
	AttendanceScheduleClass,
	AttendanceScheduleFilters,
	AttendanceScheduleItem,
	AttendanceScheduleListResponse,
	AttendanceScheduleStats,
	ScheduleOptionItem,
} from "../types";

export interface UpsertAttendanceSchedulePayload {
	academicYearId: string;
	classId: string;
	scheduleId?: string | null;
	title: string;
	scheduleType: "FROM_SCHEDULE" | "STANDALONE";
	activeDays: AttendanceDay[];
	specificDate?: string | null;
	startTime?: string | null;
	endTime?: string | null;
	isActive: boolean;
	notes?: string | null;
}

interface RawListResponse<T> {
	data?: T[] | { data?: T[]; meta?: Record<string, unknown> } | null;
	meta?: {
		totalData?: number;
		totalPages?: number;
		currentPage?: number;
		perPage?: number;
		stats?: AttendanceScheduleStats;
	};
}

function extractArray<T>(response: unknown): T[] {
	if (Array.isArray(response)) return response as T[];
	if (response && typeof response === "object") {
		const obj = response as { data?: unknown };
		if (Array.isArray(obj.data)) return obj.data as T[];
		if (obj.data && typeof obj.data === "object") {
			const nested = obj.data as { data?: unknown };
			if (Array.isArray(nested.data)) return nested.data as T[];
		}
	}
	return [];
}

export async function getAttendanceSchedules(
	filters: AttendanceScheduleFilters = {},
): Promise<AttendanceScheduleListResponse> {
	const query = new URLSearchParams();
	if (filters.academicYearId)
		query.set("academicYearId", filters.academicYearId);
	if (filters.classId) query.set("classId", filters.classId);
	if (filters.scheduleType) query.set("scheduleType", filters.scheduleType);
	if (filters.isActive) query.set("isActive", filters.isActive);
	if (filters.search?.trim()) query.set("search", filters.search.trim());
	if (filters.page) query.set("page", String(filters.page));
	if (filters.limit) query.set("limit", String(filters.limit));

	const qs = query.toString();
	const endpoint = qs ? `/attendance-schedules?${qs}` : "/attendance-schedules";
	const res = (await apiFetch(
		endpoint,
	)) as RawListResponse<AttendanceScheduleItem>;

	const rows = extractArray<AttendanceScheduleItem>(res);
	const stats = res.meta?.stats ?? {
		total: rows.length,
		active: rows.filter((r) => r.isActive).length,
		inactive: rows.filter((r) => !r.isActive).length,
		standalone: rows.filter((r) => r.scheduleType === "STANDALONE").length,
	};

	return {
		data: rows,
		meta: {
			totalData: res.meta?.totalData ?? rows.length,
			totalPages: res.meta?.totalPages ?? 1,
			currentPage: res.meta?.currentPage ?? filters.page ?? 1,
			perPage: res.meta?.perPage ?? filters.limit ?? 20,
			stats,
		},
		stats,
	};
}

export async function createAttendanceSchedule(
	payload: UpsertAttendanceSchedulePayload,
): Promise<AttendanceScheduleItem> {
	const res = (await apiFetch("/attendance-schedules", {
		method: "POST",
		body: JSON.stringify(payload),
	})) as { data: AttendanceScheduleItem };
	return res.data;
}

export async function updateAttendanceSchedule(
	id: string,
	payload: Partial<UpsertAttendanceSchedulePayload>,
): Promise<AttendanceScheduleItem> {
	const res = (await apiFetch(`/attendance-schedules/${id}`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	})) as { data: AttendanceScheduleItem };
	return res.data;
}

export async function toggleAttendanceScheduleStatus(
	id: string,
	isActive: boolean,
): Promise<AttendanceScheduleItem> {
	const res = (await apiFetch(`/attendance-schedules/${id}/status`, {
		method: "PATCH",
		body: JSON.stringify({ isActive }),
	})) as { data: AttendanceScheduleItem };
	return res.data;
}

export async function updateAttendanceScheduleDays(
	id: string,
	activeDays: AttendanceDay[],
): Promise<AttendanceScheduleItem> {
	const res = (await apiFetch(`/attendance-schedules/${id}/days`, {
		method: "PATCH",
		body: JSON.stringify({ activeDays }),
	})) as { data: AttendanceScheduleItem };
	return res.data;
}

export async function deleteAttendanceSchedule(
	id: string,
): Promise<AttendanceScheduleItem> {
	const res = (await apiFetch(`/attendance-schedules/${id}`, {
		method: "DELETE",
	})) as { data: AttendanceScheduleItem };
	return res.data;
}

export async function getAcademicYearsForAttendanceSchedules(): Promise<
	AttendanceScheduleAcademicYear[]
> {
	const res = await apiFetch("/academic-years?limit=100");
	return extractArray<AttendanceScheduleAcademicYear>(res);
}

export async function getClassesForAttendanceSchedules(): Promise<
	AttendanceScheduleClass[]
> {
	const res = await apiFetch("/classes?limit=100");
	return extractArray<AttendanceScheduleClass>(res);
}

export async function getSchedulesForAttendanceSchedules(): Promise<
	ScheduleOptionItem[]
> {
	const res = await apiFetch("/schedules?limit=100");
	return extractArray<ScheduleOptionItem>(res);
}
