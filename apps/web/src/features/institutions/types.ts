export interface InstitutionLevel {
	id: string;
	name: string;
	description?: string | null;
}

export interface Institution {
	id: string;
	institutionLevelId: string;
	name: string;
	shortName?: string | null;
	address?: string | null;
	city?: string | null;
	province?: string | null;
	postalCode?: string | null;
	phoneNumber?: string | null;
	email?: string | null;
	website?: string | null;
	logoUrl?: string | null;
	createdAt: string;
	updatedAt: string;
	institutionLevel?: InstitutionLevel | null;
}

export interface CreateInstitutionInput {
	institutionLevelId: string;
	name: string;
	shortName?: string;
	address?: string;
	city?: string;
	province?: string;
	postalCode?: string;
	phoneNumber?: string;
	email?: string;
	website?: string;
	logoUrl?: string;
}

export interface UpdateInstitutionInput {
	institutionLevelId?: string;
	name?: string;
	shortName?: string;
	address?: string;
	city?: string;
	province?: string;
	postalCode?: string;
	phoneNumber?: string;
	email?: string;
	website?: string;
	logoUrl?: string;
}

export interface PaginationMeta {
	totalData: number;
	totalPages: number;
	currentPage: number;
	perPage: number;
}

export interface ApiResponse<T> {
	status: string;
	code: number;
	message: string;
	data: T;
	meta?: PaginationMeta;
}

export interface InstitutionListResult {
	data: Institution[];
	meta: PaginationMeta;
}
