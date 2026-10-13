
export interface AcademicYear {
	id: string;
	academic_year: string;
	is_active: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface CreateAcademicYearInput {
	academic_year: string;
	is_active?: boolean;
}

export interface UpdateAcademicYearInput {
	academic_year?: string;
	is_active?: boolean;
}

export interface ApiResponse<T> {
	status: string;
	code: number;
	message: string;
	data: T;
}
