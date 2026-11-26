export type AttendanceDay =
	| "SENIN"
	| "SELASA"
	| "RABU"
	| "KAMIS"
	| "JUMAT"
	| "SABTU"
	| "MINGGU";

export type AttendanceScheduleType = "FROM_SCHEDULE" | "STANDALONE";

export interface AttendanceScheduleAcademicYear {
	id: string;
	academic_year: string;
	is_active: boolean;
	institution_id?: string | null;
}

export interface AttendanceScheduleClass {
	id: string;
	name: string;
	grade_level: number;
	institution_id?: string | null;
	academic_year_id: string;
}

export interface AttendanceScheduleLinkedSchedule {
	id: string;
	day: string;
	startTime: string | null;
	endTime: string | null;
	classroom?: {
		id: string;
		roomName: string;
		roomCode: string;
	} | null;
	classSubject?: {
		id: string;
		subject?: {
			id: string;
			name: string;
			code: string;
		} | null;
		teacher?: {
			id: string;
			user?: {
				id: string;
				name: string;
			} | null;
		} | null;
	} | null;
}

export interface AttendanceScheduleItem {
	id: string;
	academicYearId: string;
	classId: string;
	scheduleId: string | null;
	title: string;
	scheduleType: AttendanceScheduleType;
	activeDays: AttendanceDay[];
	specificDate: string | null;
	startTime: string | null;
	endTime: string | null;
	isActive: boolean;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	academicYear?: AttendanceScheduleAcademicYear | null;
	class?: AttendanceScheduleClass | null;
	schedule?: AttendanceScheduleLinkedSchedule | null;
}

export interface AttendanceScheduleStats {
	total: number;
	active: number;
	inactive: number;
	standalone: number;
}

export interface AttendanceSchedulePaginationMeta {
	totalData: number;
	totalPages: number;
	currentPage: number;
	perPage: number;
	stats?: AttendanceScheduleStats;
}

export interface AttendanceScheduleListResponse {
	data: AttendanceScheduleItem[];
	meta: AttendanceSchedulePaginationMeta;
	stats: AttendanceScheduleStats;
}

export interface AttendanceScheduleFilters {
	academicYearId?: string;
	classId?: string;
	scheduleType?: AttendanceScheduleType | "";
	isActive?: "true" | "false" | "";
	search?: string;
	page?: number;
	limit?: number;
}

export interface ScheduleOptionItem {
	id: string;
	day: string;
	startTime: string | null;
	endTime: string | null;
	classroom?: {
		id: string;
		roomName: string;
		roomCode: string;
	} | null;
	classSubject?: {
		id: string;
		classId?: string;
		class?: {
			id: string;
			name: string;
		} | null;
		subject?: {
			id: string;
			name: string;
			code: string;
		} | null;
	} | null;
}
