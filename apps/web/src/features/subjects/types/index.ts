export interface Subject {
	id: string;
	code: string;
	name: string;
	credits: number | null;
	description: string | null;
	institutionId: string;
	departmentId: string | null;
	createdAt: string;
	updatedAt: string;
	institution?: { id: string; name: string };
	department?: { id: string; name: string } | null;
}

export interface SubjectPage {
	data: Subject[];
	total: number;
}

export interface SubjectQuery {
	page: number;
	limit: number;
	search?: string;
}

export interface CreateSubjectInput {
	code: string;
	name: string;
	credits?: number;
	description?: string;
	institutionId: string;
	departmentId?: string;
}

export interface UpdateSubjectInput {
	code?: string;
	name?: string;
	credits?: number;
	description?: string;
	departmentId?: string | null;
}

export interface SubjectApiResponse<T> {
	status: string;
	code: number;
	message: string;
	data: {
		code: number;
		message: string;
		data: T;
	};
}
