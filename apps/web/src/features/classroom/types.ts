export interface ClassroomInstitution {
	id: string;
	name: string;
	shortName?: string | null;
}

export interface Classroom {
	id: string;
	roomCode: string;
	roomName: string;
	building?: string | null;
	floor?: number | null;
	capacity?: number | null;
	description?: string | null;
	createdAt?: string;
	updatedAt?: string;
	institution?: ClassroomInstitution | null;
	_count?: { schedules: number } | null;
}

export interface ClassroomListResult {
	data: Classroom[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface CreateClassroomInput {
	institutionId: string;
	roomCode: string;
	roomName: string;
	building?: string | null;
	floor?: number | null;
	capacity?: number | null;
	description?: string | null;
}

export interface UpdateClassroomInput {
	roomCode?: string;
	roomName?: string;
	building?: string | null;
	floor?: number | null;
	capacity?: number | null;
	description?: string | null;
}

export interface ClassroomConfig {
	list: boolean;
	search: boolean;
	create: boolean;
	update: boolean;
	softDelete: boolean;
	summary: boolean;
	filterOptions: boolean;
	buildingFloorFilters: boolean;
	scheduleCount: boolean;
	fieldErrors: boolean;
}

export interface ApiErrorField {
	field: string;
	message: string;
}

export interface ApiErrorResponse {
	status: string;
	code: number;
	message: string;
	data: unknown | null;
	errors?: ApiErrorField[];
}
