import { apiFetch } from "@/lib/api";
import type {
	AcademicYearOption,
	Attendance,
	AttendanceFilters,
	AttendanceListResponse,
	AttendancePaginationMeta,
	AttendanceStatusOption,
	AttendanceSummary,
	BulkUpsertAttendanceInput,
	ClassOption,
	ClassStudentOption,
	CreateAttendanceInput,
	ScheduleOption,
	UpdateAttendanceInput,
	UpsertAttendanceInput,
} from "../types";

interface ApiResponse<T> {
	data: T;
	meta?: AttendancePaginationMeta;
	message?: string;
	status?: string;
}

export const getAttendances = async (
	params: AttendanceFilters = {},
): Promise<AttendanceListResponse> => {
	const query = new URLSearchParams();
	if (params.page) query.set("page", String(params.page));
	if (params.limit) query.set("limit", String(params.limit));
	if (params.search?.trim()) query.set("search", params.search.trim());
	if (params.student_id) query.set("student_id", params.student_id);
	if (params.attendance_status_id)
		query.set("attendance_status_id", params.attendance_status_id);
	if (params.schedule_id) query.set("schedule_id", params.schedule_id);
	if (params.class_id) query.set("class_id", params.class_id);
	if (params.attendance_date)
		query.set("attendance_date", params.attendance_date);
	if (params.start_date) query.set("start_date", params.start_date);
	if (params.end_date) query.set("end_date", params.end_date);
	if (params.month) query.set("month", String(params.month));
	if (params.year) query.set("year", String(params.year));

	const queryString = query.toString();
	const endpoint = queryString ? `/attendances?${queryString}` : "/attendances";

	const response = (await apiFetch(endpoint)) as {
		data?:
			| Attendance[]
			| { data?: Attendance[]; meta?: AttendancePaginationMeta }
			| null;
		meta?: AttendancePaginationMeta;
	};

	if (Array.isArray(response?.data)) {
		const meta = response.meta ?? {
			currentPage: params.page ?? 1,
			perPage: params.limit ?? response.data.length,
			totalData: response.data.length,
			totalPages: Math.max(
				1,
				Math.ceil(response.data.length / (params.limit ?? 10)),
			),
		};
		return {
			data: response.data,
			meta,
		};
	}

	if (response?.data && Array.isArray(response.data.data)) {
		const meta = response.data.meta ?? {
			currentPage: params.page ?? 1,
			perPage: params.limit ?? response.data.data.length,
			totalData: response.data.data.length,
			totalPages: Math.max(
				1,
				Math.ceil(response.data.data.length / (params.limit ?? 10)),
			),
		};
		return {
			data: response.data.data,
			meta,
		};
	}

	return {
		data: [],
		meta: {
			currentPage: params.page ?? 1,
			perPage: params.limit ?? 10,
			totalData: 0,
			totalPages: 1,
		},
	};
};

export const getAttendanceSummary = async (
	params: AttendanceFilters = {},
): Promise<AttendanceSummary> => {
	const query = new URLSearchParams();
	if (params.class_id) query.set("class_id", params.class_id);
	if (params.schedule_id) query.set("schedule_id", params.schedule_id);
	if (params.student_id) query.set("student_id", params.student_id);
	if (params.attendance_status_id)
		query.set("attendance_status_id", params.attendance_status_id);
	if (params.attendance_date)
		query.set("attendance_date", params.attendance_date);
	if (params.start_date) query.set("start_date", params.start_date);
	if (params.end_date) query.set("end_date", params.end_date);
	if (params.month) query.set("month", String(params.month));
	if (params.year) query.set("year", String(params.year));
	if (params.search?.trim()) query.set("search", params.search.trim());

	const queryString = query.toString();
	const endpoint = queryString
		? `/attendances/summary?${queryString}`
		: "/attendances/summary";

	const response = (await apiFetch(endpoint)) as ApiResponse<AttendanceSummary>;
	return (
		response.data ?? {
			total: 0,
			present: 0,
			permission: 0,
			sick: 0,
			absent: 0,
			attendanceRate: 0,
		}
	);
};

export const getAttendanceById = async (id: string): Promise<Attendance> => {
	const response = (await apiFetch(
		`/attendances/${id}`,
	)) as ApiResponse<Attendance>;
	return response.data;
};

export const createAttendance = async (
	input: CreateAttendanceInput,
): Promise<Attendance> => {
	const response = (await apiFetch("/attendances", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	})) as ApiResponse<Attendance>;
	return response.data;
};

export const upsertAttendance = async (
	input: UpsertAttendanceInput,
): Promise<Attendance> => {
	const response = (await apiFetch("/attendances/upsert", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	})) as ApiResponse<Attendance>;
	return response.data;
};

export const bulkUpsertAttendance = async (
	input: BulkUpsertAttendanceInput,
): Promise<Attendance[]> => {
	const response = (await apiFetch("/attendances/bulk-upsert", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	})) as ApiResponse<Attendance[]>;
	return response.data ?? [];
};

export const updateAttendance = async (
	id: string,
	input: UpdateAttendanceInput,
): Promise<Attendance> => {
	const response = (await apiFetch(`/attendances/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(input),
	})) as ApiResponse<Attendance>;
	return response.data;
};

export const deleteAttendance = async (id: string): Promise<void> => {
	await apiFetch(`/attendances/${id}`, {
		method: "DELETE",
	});
};

// Aliases for backward compatibility
export const getAttendancesApi = getAttendances;
export const getAttendanceSummaryApi = getAttendanceSummary;
export const getAttendanceByIdApi = getAttendanceById;
export const createAttendanceApi = createAttendance;
export const updateAttendanceApi = updateAttendance;
export const deleteAttendanceApi = deleteAttendance;

// ===========================
// Lookup & Options Helpers
// ===========================

function extractArray<T>(payload: unknown): T[] {
	let curr = payload;
	while (curr && typeof curr === "object") {
		if (Array.isArray(curr)) return curr as T[];
		if ("data" in curr) {
			curr = (curr as { data: unknown }).data;
		} else {
			break;
		}
	}
	return Array.isArray(curr) ? (curr as T[]) : [];
}

interface RawClassItem {
	id: string;
	name: string;
	grade_level?: number | null;
	academic_year_id?: string | null;
}

export const getClassesOptions = async (): Promise<ClassOption[]> => {
	try {
		const response = await apiFetch("/classes?limit=100");
		const items = extractArray<RawClassItem>(response);
		return items.map((cls) => ({
			id: cls.id,
			name: cls.name,
			grade_level: cls.grade_level,
			academic_year_id: cls.academic_year_id,
		}));
	} catch {
		return [];
	}
};

interface RawScheduleItem {
	id: string;
	day: string;
	startTime?: string | null;
	endTime?: string | null;
	classroom?: {
		roomName: string;
	} | null;
	classSubject?: {
		class?: {
			id: string;
			name: string;
		} | null;
		subject?: {
			name: string;
		} | null;
		teacher?: {
			teacher_number?: string | null;
			profile?: {
				fullName: string;
			} | null;
		} | null;
	} | null;
}

export const getSchedulesOptions = async (
	classId?: string,
): Promise<ScheduleOption[]> => {
	try {
		const query = new URLSearchParams();
		query.set("limit", "100");
		const response = await apiFetch(`/schedules?${query.toString()}`);
		const items = extractArray<RawScheduleItem>(response);

		const filtered = classId
			? items.filter((sch) => sch.classSubject?.class?.id === classId)
			: items;

		return filtered.map((sch) => {
			const className = sch.classSubject?.class?.name ?? "Kelas";
			const subjectName = sch.classSubject?.subject?.name ?? "Mapel";
			const teacherName =
				sch.classSubject?.teacher?.profile?.fullName ??
				(sch.classSubject?.teacher?.teacher_number
					? `Guru (${sch.classSubject.teacher.teacher_number})`
					: "Pengajar");
			const classroomName = sch.classroom?.roomName;
			const timeLabel =
				sch.startTime && sch.endTime
					? `${sch.startTime.slice(0, 5)} - ${sch.endTime.slice(0, 5)}`
					: "";

			const parts = [`[${className}]`, subjectName, `(${teacherName})`];
			if (sch.day) parts.push(`• ${sch.day}`);
			if (timeLabel) parts.push(timeLabel);

			return {
				id: sch.id,
				day: sch.day,
				startTime: sch.startTime,
				endTime: sch.endTime,
				classId: sch.classSubject?.class?.id,
				className,
				subjectName,
				teacherName,
				classroomName,
				label: parts.join(" "),
			};
		});
	} catch {
		return [];
	}
};

interface RawAttendanceStatusItem {
	id: string;
	name: string;
	description?: string | null;
}

export const getAttendanceStatusesOptions = async (): Promise<
	AttendanceStatusOption[]
> => {
	try {
		const response = await apiFetch("/attendance-statuses?limit=50");
		const items = extractArray<RawAttendanceStatusItem>(response);

		return items.map((status) => {
			const lower = status.name.toLowerCase();
			let typeCategory: AttendanceStatusOption["typeCategory"] = "other";
			if (lower.includes("hadir") || lower === "present")
				typeCategory = "hadir";
			else if (lower.includes("izin") || lower.includes("permit"))
				typeCategory = "izin";
			else if (lower.includes("sakit") || lower.includes("sick"))
				typeCategory = "sakit";
			else if (
				lower.includes("alpa") ||
				lower.includes("absen") ||
				lower.includes("alpha")
			)
				typeCategory = "alpa";

			return {
				id: status.id,
				name: status.name,
				description: status.description,
				typeCategory,
			};
		});
	} catch {
		return [];
	}
};

interface RawAcademicYearItem {
	id: string;
	name?: string;
	academic_year?: string;
	year?: string;
	is_active?: boolean;
}

export const getAcademicYearsOptions = async (): Promise<
	AcademicYearOption[]
> => {
	try {
		const response = await apiFetch("/academic-years?limit=50");
		const items = extractArray<RawAcademicYearItem>(response);
		return items.map((ay) => {
			const yearName = ay.academic_year || ay.name || ay.year || "Tahun Ajaran";
			const statusLabel = ay.is_active ? "Aktif" : "Tidak Aktif";
			return {
				id: ay.id,
				name: yearName,
				academic_year: ay.academic_year,
				is_active: ay.is_active,
				label: `${yearName} (${statusLabel})`,
			};
		});
	} catch {
		return [];
	}
};

interface RawClassStudentItem {
	studentId?: string;
	class?: {
		name?: string;
	} | null;
	student?: {
		id: string;
		studentNumber?: string | null;
		profile?: {
			fullName: string;
		} | null;
	} | null;
}

export const getClassStudentsOptions = async (
	classId?: string,
): Promise<ClassStudentOption[]> => {
	try {
		const endpoint = classId
			? `/class-students?classId=${classId}&limit=100`
			: "/class-students?limit=100";
		const response = await apiFetch(endpoint);
		const items = extractArray<RawClassStudentItem>(response);

		return items
			.map((cs) => {
				const id = cs.student?.id ?? cs.studentId ?? "";
				const studentNumber = cs.student?.studentNumber ?? "-";
				const fullName = cs.student?.profile?.fullName ?? "Siswa";
				const className = cs.class?.name;
				return {
					studentId: id,
					studentNumber,
					fullName,
					className,
				};
			})
			.filter((cs) => Boolean(cs.studentId));
	} catch {
		return [];
	}
};
