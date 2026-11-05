export interface ClassroomBrief {
	id: string;
	roomCode: string;
	roomName: string;
}

export interface ClassSubjectBrief {
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
}

export interface ScheduleBrief {
	id: string;
	day: string;
	startTime?: string | null;
	endTime?: string | null;
	classroomId?: string;
	classroom?: ClassroomBrief | null;
	classSubject?: ClassSubjectBrief | null;
}

export interface UserBrief {
	id: string;
	email?: string | null;
	name?: string | null;
	profile?: {
		fullName?: string | null;
	} | null;
}

export interface TeachingJournal {
	id: string;
	schedule_id: string;
	meeting_number: number | null;
	journal_date: string | null;
	topic: string | null;
	material: string | null;
	notes: string | null;
	created_at?: string;
	updated_at?: string;
	created_by?: string | null;
	updated_by?: string | null;
	schedule?: ScheduleBrief | null;
	createdBy?: UserBrief | null;
	updatedBy?: UserBrief | null;
}

export interface TeachingJournalPageMeta {
	currentPage: number;
	perPage: number;
	totalData: number;
	totalPages: number;
}

export interface TeachingJournalListResponse {
	data: TeachingJournal[];
	meta: TeachingJournalPageMeta;
}

export interface TeachingJournalParams {
	page?: number;
	limit?: number;
	search?: string;
	schedule_id?: string;
	journal_date?: string;
}

export interface CreateTeachingJournalInput {
	schedule_id: string;
	meeting_number?: number | null;
	journal_date?: string | null;
	topic?: string | null;
	material?: string | null;
	notes?: string | null;
}

export interface UpdateTeachingJournalInput {
	schedule_id?: string;
	meeting_number?: number | null;
	journal_date?: string | null;
	topic?: string | null;
	material?: string | null;
	notes?: string | null;
}

export interface ScheduleOption {
	id: string;
	label: string;
	day: string;
	className: string;
	subjectName: string;
	teacherName: string;
	roomName: string;
	timeRange: string;
}

// Backward compatibility aliases
export type Journal = TeachingJournal;
export type JournalParams = TeachingJournalParams;
export type JournalList = TeachingJournalListResponse;
