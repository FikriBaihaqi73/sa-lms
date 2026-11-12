export interface AttendanceStatusItem {
	id: string;
	name: string;
	description?: string | null;
}

export interface AttendanceStudentProfile {
	id: string;
	fullName: string;
	email?: string | null;
	phoneNumber?: string | null;
	gender?: string | null;
}

export interface AttendanceStudentItem {
	id: string;
	studentNumber?: string | null;
	profile?: AttendanceStudentProfile | null;
}

export interface AttendanceClassItem {
	id: string;
	name: string;
	grade_level?: number | null;
	institution_id?: string | null;
}

export interface AttendanceSubjectItem {
	id: string;
	name: string;
	code?: string | null;
}

export interface AttendanceTeacherProfile {
	id: string;
	fullName: string;
}

export interface AttendanceTeacherItem {
	id: string;
	teacher_number?: string | null;
	profile?: AttendanceTeacherProfile | null;
}

export interface AttendanceClassSubjectItem {
	id: string;
	class_id?: string;
	subject_id?: string;
	teacher_id?: string;
	academic_year_id?: string;
	class?: AttendanceClassItem | null;
	subject?: AttendanceSubjectItem | null;
	teacher?: AttendanceTeacherItem | null;
}

export interface AttendanceClassroomItem {
	id: string;
	roomCode: string;
	roomName: string;
}

export interface AttendanceScheduleItem {
	id: string;
	day: string;
	startTime: string | null;
	endTime: string | null;
	classroom?: AttendanceClassroomItem | null;
	classSubject?: AttendanceClassSubjectItem | null;
}

export interface Attendance {
	id: string;
	schedule_id: string;
	student_id: string;
	attendance_status_id: string;
	attendance_date: string | null;
	notes?: string | null;
	created_at: string;
	updated_at: string;
	attendance_status?: AttendanceStatusItem | null;
	student?: AttendanceStudentItem | null;
	schedule?: AttendanceScheduleItem | null;
}

export interface AttendanceSummary {
	total: number;
	present: number;
	permission: number;
	sick: number;
	absent: number;
	attendanceRate: number;
}

export interface AttendanceFilters {
	page?: number;
	limit?: number;
	search?: string;
	student_id?: string;
	attendance_status_id?: string;
	schedule_id?: string;
	class_id?: string;
	attendance_date?: string;
	start_date?: string;
	end_date?: string;
	month?: number;
	year?: number;
}

export interface AttendancePaginationMeta {
	currentPage: number;
	perPage: number;
	totalData: number;
	totalPages: number;
}

export interface AttendanceListResponse {
	data: Attendance[];
	meta: AttendancePaginationMeta;
}

export interface CreateAttendanceInput {
	schedule_id: string;
	student_id: string;
	attendance_status_id: string;
	attendance_date?: string;
	notes?: string | null;
}

export type UpdateAttendanceInput = Partial<CreateAttendanceInput>;

export interface UpsertAttendanceInput {
	schedule_id: string;
	student_id: string;
	attendance_status_id: string;
	attendance_date: string;
	notes?: string | null;
}

export interface BulkUpsertAttendanceInput {
	schedule_id: string;
	attendance_date: string;
	attendance_status_id: string;
	student_ids?: string[];
	notes?: string | null;
}

// Matrix Types
export interface AttendanceMonthDay {
	dateStr: string; // YYYY-MM-DD
	dayNumber: number;
	dayNumberFormatted: string; // "01", "02"
	dayName: string; // "Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"
	dayOfWeek: number; // 0 = Minggu, 1 = Senin, ...
	isScheduleActive: boolean;
}

export interface AttendanceMatrixCell {
	dateStr: string;
	isScheduleActive: boolean;
	attendance: Attendance | null;
	statusId?: string | null;
	statusName?: string | null; // "Hadir" | "Izin" | "Sakit" | "Alpa" | null
	notes?: string | null;
}

export interface AttendanceMatrixStudentRow {
	studentId: string;
	studentNumber: string;
	fullName: string;
	className?: string;
	cells: Record<string, AttendanceMatrixCell>;
	totalPresent: number;
	totalPermission: number;
	totalSick: number;
	totalAbsent: number;
	attendanceRate: number;
}

// Options for dropdowns
export interface ClassOption {
	id: string;
	name: string;
	grade_level?: number | null;
	academic_year_id?: string | null;
}

export interface ScheduleOption {
	id: string;
	day: string;
	startTime?: string | null;
	endTime?: string | null;
	classId?: string;
	className: string;
	subjectName: string;
	teacherName: string;
	classroomName?: string;
	label: string;
}

export interface AttendanceStatusOption {
	id: string;
	name: string;
	description?: string | null;
	typeCategory?: "hadir" | "izin" | "sakit" | "alpa" | "other";
}

export interface AcademicYearOption {
	id: string;
	name: string;
	academic_year?: string;
	is_active?: boolean;
	label?: string;
}

export interface ClassStudentOption {
	studentId: string;
	studentNumber: string;
	fullName: string;
	className?: string;
}
