export interface StudyPlanStudent {
	id: string;
	studentNumber: string;
	profileId?: string | null;
	profile?: {
		id?: string;
		fullName?: string;
		email?: string | null;
		identityNumber?: string | null;
	} | null;
}

export interface StudyPlanClassSubject {
	id: string;
	class_id: string;
	subject_id: string;
	teacher_id: string;
	academic_year_id: string;
	class?: {
		id: string;
		name: string;
		grade_level?: number;
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
			fullName?: string | null;
		} | null;
	} | null;
	academic_year?: {
		id: string;
		academic_year: string;
		is_active?: boolean;
	} | null;
}

export interface StudyPlanAcademicYear {
	id: string;
	academic_year: string;
	is_active: boolean;
	institution_id?: string | null;
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
}

export interface CreateStudyPlanInput {
	student_id: string;
	class_subject_id: string;
	academic_year_id: string;
}

export interface UpdateStudyPlanInput {
	student_id?: string;
	class_subject_id?: string;
	academic_year_id?: string;
}

export interface StudentOption {
	id: string;
	studentNumber: string;
	fullName: string;
}

export interface ClassSubjectOption {
	id: string;
	subjectName: string;
	subjectCode?: string | null;
	className: string;
	teacherName?: string | null;
	academicYearName?: string | null;
}

export interface AcademicYearOption {
	id: string;
	academic_year: string;
	is_active: boolean;
}

