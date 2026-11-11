export interface StudyPlanDepartment {
	id: string;
	name: string;
	code?: string | null;
}

export interface StudyPlanSubject {
	id: string;
	name: string;
	code?: string | null;
	credits?: number | null;
	description?: string | null;
	departmentId?: string | null;
	department?: StudyPlanDepartment | null;
}

export interface StudyPlanTeacherProfile {
	id?: string;
	fullName?: string | null;
	email?: string | null;
}

export interface StudyPlanTeacher {
	id: string;
	teacher_number?: string | null;
	profile?: StudyPlanTeacherProfile | null;
}

export interface StudyPlanClass {
	id: string;
	name: string;
	grade_level?: number | null;
}

export interface StudyPlanAcademicYear {
	id: string;
	academic_year: string;
	is_active: boolean;
	institution_id?: string | null;
}

export interface StudyPlanStudentProfile {
	id?: string;
	fullName?: string | null;
	email?: string | null;
	identityNumber?: string | null;
}

export interface StudyPlanStudent {
	id: string;
	studentNumber: string;
	profileId?: string | null;
	departmentId?: string | null;
	profile?: StudyPlanStudentProfile | null;
}

export interface StudyPlanClassSubject {
	id: string;
	class_id: string;
	subject_id: string;
	teacher_id: string;
	academic_year_id: string;
	class?: StudyPlanClass | null;
	subject?: StudyPlanSubject | null;
	teacher?: StudyPlanTeacher | null;
	academic_year?: StudyPlanAcademicYear | null;
}

export interface StudyPlan {
	id: string;
	created_at: string;
	updated_at: string;
	deleted_at?: string | null;
	student_id: string;
	class_subject_id: string;
	academic_year_id: string;
	student?: StudyPlanStudent | null;
	classSubject?: StudyPlanClassSubject | null;
	academicYear?: StudyPlanAcademicYear | null;
}

export interface StudyPlanMeta {
	totalData: number;
	totalPages: number;
	currentPage: number;
	perPage: number;
}

export interface StudyPlanListResult {
	data: StudyPlan[];
	meta: StudyPlanMeta;
}

export interface StudyPlanFilters {
	page?: number;
	limit?: number;
	search?: string;
	student_id?: string;
	class_subject_id?: string;
	academic_year_id?: string;
	department_id?: string;
}

export interface CreateStudyPlanInput {
	student_id: string;
	class_subject_id: string;
	academic_year_id?: string;
}

export interface UpdateStudyPlanInput {
	student_id?: string;
	class_subject_id?: string;
	academic_year_id?: string;
}

export type StudyPlanViewMode = "student_view" | "catalog_view" | "log_view";

export interface StudentKrsSummary {
	studentId: string;
	studentNumber: string;
	fullName: string;
	email?: string | null;
	className?: string;
	departmentName?: string;
	totalSubjects: number;
	totalCredits: number;
	maxCredits: number;
	status: "sudah_krs" | "belum_krs";
	studyPlans: StudyPlan[];
}

export interface StudentOption {
	id: string;
	studentNumber: string;
	fullName: string;
	email?: string | null;
	className?: string | null;
	departmentId?: string | null;
	departmentName?: string | null;
	currentCredits?: number;
}

export interface ClassSubjectOption {
	id: string;
	subjectId?: string;
	subjectName: string;
	subjectCode?: string | null;
	credits: number;
	className: string;
	teacherName?: string | null;
	departmentId?: string | null;
	departmentName?: string | null;
	academicYearId?: string | null;
	academicYearName?: string | null;
	isAcademicYearActive?: boolean;
	isActive?: boolean;
	enrolledCount?: number;
	label: string;
}

export interface AcademicYearOption {
	id: string;
	academic_year: string;
	is_active: boolean;
	label: string;
}

export interface DepartmentOption {
	id: string;
	name: string;
	code: string;
}

export interface StudyPlanSummaryStats {
	studentsWithKrsCount: number;
	totalEnrollments: number;
	totalCreditsEnrolled: number;
	activeClassSubjectsCount: number;
	departmentsCount: number;
	studentsWithoutKrsCount: number;
}
