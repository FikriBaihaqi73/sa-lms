export interface ModuleClassSubject {
	id: string;
	class?: {
		id: string;
		name: string;
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
			id: string;
			fullName: string;
		} | null;
	} | null;
	academic_year?: {
		id: string;
		academic_year: string;
		is_active: boolean;
	} | null;
}

export interface LearningModule {
	id: string;
	class_subject_id: string;
	title: string;
	description?: string | null;
	display_order?: number | null;
	is_published?: boolean | null;
	is_locked?: boolean | null;
	created_at?: string | null;
	updated_at?: string | null;
	deleted_at?: string | null;
	class_subject?: ModuleClassSubject | null;
	moduleContents?: Array<{
		id: string;
		title: string;
		contentType?: string;
		sortOrder?: number;
	}> | null;
	assignments?: Array<{
		id: string;
		title: string;
	}> | null;
}

export interface ModulePageMeta {
	currentPage: number;
	perPage: number;
	totalData: number;
	totalPages: number;
}

export interface ModuleListResponse {
	status: string;
	message: string;
	code: number;
	data: LearningModule[];
	meta: ModulePageMeta;
}

export interface ModuleParams {
	page?: number;
	limit?: number;
	search?: string;
	class_subject_id?: string;
}

export interface CreateModuleInput {
	class_subject_id: string;
	title: string;
	description?: string | null;
	display_order?: number | null;
	is_published?: boolean | null;
	is_locked?: boolean | null;
}

export interface UpdateModuleInput {
	class_subject_id?: string;
	title?: string;
	description?: string | null;
	display_order?: number | null;
	is_published?: boolean | null;
	is_locked?: boolean | null;
}

export interface ClassSubjectOption {
	id: string;
	label: string;
	className: string;
	subjectName: string;
	teacherName: string;
	academicYear: string;
}

