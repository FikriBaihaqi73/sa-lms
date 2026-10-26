export interface ClassStudentClassSummary {
	id: string;
	name: string;
	grade_level?: number;
	capacity?: number | null;
	academic_year?: {
		id?: string;
		academic_year?: string;
		is_active?: boolean;
	} | null;
}

export interface ClassStudentStudentSummary {
	id: string;
	studentNumber: string;
	profileId?: string | null;
	academicStatusId?: string | null;
	profile?: {
		id?: string;
		fullName?: string;
		email?: string | null;
		photoUrl?: string | null;
	} | null;
}

export interface ClassStudentItem {
	id: string;
	classId: string;
	studentId: string;
	createdAt: string;
	updatedAt?: string;
	deletedAt?: string | null;
	classes?: ClassStudentClassSummary | null;
	student?: ClassStudentStudentSummary | null;
}

export interface ClassStudentPageMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface ClassStudentListResult {
	data: ClassStudentItem[];
	meta: ClassStudentPageMeta;
}

export interface ClassStudentsSummary {
	totalActive: number;
	recentJoined: number;
	totalDeleted: number;
	filledClassesCount: number;
	totalClassesCount: number;
}

export type ClassStudentStatusFilter = "active" | "deleted";

export interface GetClassStudentsParams {
	page?: number;
	limit?: number;
	search?: string;
	classId?: string;
	status?: ClassStudentStatusFilter;
}

export interface CreateClassStudentInput {
	classId: string;
	studentId: string;
}

export interface BatchCreateClassStudentsInput {
	classId: string;
	studentIds: string[];
}

export interface CandidateStudentItem {
	id: string;
	studentNumber: string;
	fullName: string;
	isPreviouslyRemoved?: boolean;
	currentClassName?: string | null;
}

export interface ClassOption {
	id: string;
	name: string;
	academicYear?: string | null;
}
