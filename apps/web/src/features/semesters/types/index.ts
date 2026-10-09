export interface SemesterAcademicYear {
	id: string;
	academic_year: string;
	is_active: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface Semester {
	id: string;
	academic_year_id: string;
	name: string;
	start_date: string | null;
	end_date: string | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	academicYear: SemesterAcademicYear | null;
}

export interface SemesterPageMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface SemesterListResult {
	data: Semester[];
	meta: SemesterPageMeta;
}

export interface CreateSemesterInput {
	academic_year_id: string;
	name: string;
	start_date?: string;
	end_date?: string;
	is_active?: boolean;
}

export interface UpdateSemesterInput {
	academic_year_id?: string;
	name?: string;
	start_date?: string;
	end_date?: string;
	is_active?: boolean;
}

