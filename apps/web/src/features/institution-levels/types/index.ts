export interface InstitutionLevel {
	id: string;
	name: string;
	description?: string | null;
	createdAt?: string;
	updated_at?: string;
	_count?: {
		institutions: number;
	};
}

export interface ApiResponse<T> {
	status: "success" | "error";
	code: number;
	message: string;
	data: T;
}

export interface CreateInstitutionLevelInput {
	name: string;
	description?: string;
}

export interface UpdateInstitutionLevelInput {
	name?: string;
	description?: string;
}

export interface DeleteInstitutionLevelResult {
	success: boolean;
	id: string;
}
