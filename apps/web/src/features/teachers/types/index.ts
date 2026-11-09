export interface TeacherProfileUser {
	id: string;
	email: string;
	is_active: boolean;
}

export interface TeacherProfile {
	id: string;
	fullName: string;
	email?: string | null;
	phoneNumber?: string | null;
	gender?: string | null;
	userId: string | null;
	users?: TeacherProfileUser | null;
}

export type TeacherFormProfile = TeacherProfile;

export interface Teacher {
	id: string;
	profile_id?: string | null;
	department_id?: string | null;
	specialization_id?: string | null;
	employment_status_id?: string | null;
	teacher_number: string;
	join_date?: string | null;
	created_at: string;
	updated_at: string;
	profile?: TeacherProfile | null;
	department?: { id: string; name: string; code?: string | null } | null;
	employment_status?: { id: string; name: string } | null;
	specialization?: { id: string; name: string } | null;
	_count?: {
		classSubjects?: number;
		classes?: number;
	};
}

export interface TeacherPageMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface TeacherListResult {
	data: Teacher[];
	meta: TeacherPageMeta;
}

export interface TeacherStats {
	total: number;
	tetapCount: number;
	honorerCount: number;
	specializationCount: number;
	totalClassAssignments: number;
	unassignedCount: number;
}

export interface TeacherReference {
	id: string;
	name: string;
	code?: string | null;
}

export interface TeacherClassAssignment {
	id: string;
	class_id: string;
	subject_id: string;
	teacher_id: string;
	academic_year_id: string;
	class?: { id: string; name: string } | null;
	subject?: { id: string; name: string; code?: string | null } | null;
}

export interface CreateTeacherInput {
	full_name: string;
	email: string;
	password: string;
	gender?: string | null;
	phone?: string | null;
	teacher_number: string;
	join_date?: string | null;
	department_id?: string | null;
	specialization_id?: string | null;
	employment_status_id?: string | null;
}

export interface UpdateTeacherInput {
	full_name?: string;
	email?: string;
	password?: string | null;
	gender?: string | null;
	phone?: string | null;
	teacher_number?: string;
	join_date?: string | null;
	department_id?: string | null;
	specialization_id?: string | null;
	employment_status_id?: string | null;
}

export interface TeacherCreatedCredentials {
	fullName: string;
	email: string;
	password: string;
	teacherNumber: string;
}
