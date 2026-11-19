export interface StudentProfile {
	id?: string;
	fullName: string;
	email?: string | null;
	phoneNumber?: string | null;
	identityNumber?: string | null;
}

export interface StudentClassStudentItem {
	id: string;
	classId: string;
	classes?: {
		id: string;
		name: string;
		grade_level?: number;
	} | null;
}

export interface StudentDetail {
	id: string;
	studentNumber: string;
	departmentId?: string | null;
	profile?: StudentProfile | null;
	classStudents?: StudentClassStudentItem[];
}

export interface AcademicYearDetail {
	id: string;
	academic_year: string;
	is_active?: boolean;
}

export interface SemesterDetail {
	id: string;
	name: string;
	is_active?: boolean;
}

export interface AcademicStatusDetail {
	id: string;
	name: string;
	description?: string | null;
}

export interface StudyResult {
	id: string;
	createdAt: string;
	updatedAt: string;
	deletedAt?: string | null;
	studentId: string;
	academicYearId: string;
	semesterId: string;
	totalCredits: number | null;
	semesterGpa: number | string | null;
	cumulativeGpa: number | string | null;
	academicStatusId: string | null;
	student?: StudentDetail | null;
	academicYear?: AcademicYearDetail | null;
	semester?: SemesterDetail | null;
	academicStatus?: AcademicStatusDetail | null;
}

export interface StudyResultListMeta {
	totalData: number;
	totalPages: number;
	currentPage: number;
	perPage: number;
}

export interface StudyResultListResponse {
	data: StudyResult[];
	meta: StudyResultListMeta;
}

export interface StudyResultFilters {
	search?: string;
	departmentId?: string;
	classId?: string;
	academicYearId?: string;
	semesterId?: string;
	academicStatusId?: string;
	page?: number;
	limit?: number;
}

export interface StudyResultStats {
	totalRecords: number;
	averageCumulativeGpa: number;
	averageSemesterGpa: number;
	activeStudentsCount: number;
}

export interface DepartmentOption {
	id: string;
	name: string;
	code: string;
}

export interface ClassOption {
	id: string;
	name: string;
	grade_level?: number;
}

export interface AcademicYearOption {
	id: string;
	academic_year: string;
	is_active?: boolean;
}

export interface SemesterOption {
	id: string;
	name: string;
	is_active?: boolean;
}

export interface AcademicStatusOption {
	id: string;
	name: string;
}

export interface StudentOption {
	id: string;
	studentNumber: string;
	fullName: string;
}

export interface CreateStudyResultInput {
	studentId: string;
	academicYearId: string;
	semesterId: string;
	totalCredits?: number | null;
	semesterGpa?: number | null;
	cumulativeGpa?: number | null;
	academicStatusId?: string | null;
}

export interface UpdateStudyResultInput {
	studentId?: string;
	academicYearId?: string;
	semesterId?: string;
	totalCredits?: number | null;
	semesterGpa?: number | null;
	cumulativeGpa?: number | null;
	academicStatusId?: string | null;
}
