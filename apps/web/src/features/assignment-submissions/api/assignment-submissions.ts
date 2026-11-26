import { apiFetch } from "@/lib/api";
import type { SubmissionRow } from "../types";

interface ApiResponse<T> {
	status: string;
	data: T;
	message?: string;
	code?: number;
}

export interface GetAssignmentSubmissionsParams {
	page?: number;
	limit?: number;
	search?: string;
}

export interface AssignmentSubmissionsResponseData {
	data: SubmissionRow[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export interface RawAssignmentRecord {
	id: string;
	title: string;
	due_date?: string | null;
	module?: {
		id: string;
		title: string;
		class_subject?: {
			id: string;
			class_id?: string | null;
			subject_id?: string | null;
			academic_year_id?: string | null;
			class?: { id: string; name: string } | null;
			subject?: { id: string; name: string; code?: string | null } | null;
			academic_year?: { id: string; academic_year: string } | null;
		} | null;
	} | null;
}

export interface RawSubmissionRecord {
	id: string;
	assignmentId: string;
	studentId: string;
	submittedAt?: string | null;
	score?: string | number | null;
	feedback?: string | null;
	status?: string | null;
	gradedAt?: string | null;
	student?: {
		id: string;
		studentNumber?: string | null;
		profile?: {
			fullName?: string | null;
		} | null;
	} | null;
	grader?: {
		id: string;
		name?: string | null;
	} | null;
}

export interface RawAcademicYearRecord {
	id: string;
	academic_year: string;
	is_active?: boolean;
}

export interface RawClassRecord {
	id: string;
	name: string;
	academic_year_id: string;
}

export interface RawClassStudentRecord {
	id: string;
	classId: string;
	studentId: string;
	student?: {
		id: string;
		studentNumber?: string | null;
		profile?: {
			fullName?: string | null;
		} | null;
	} | null;
}

function extractArray<T>(payload: unknown): T[] {
	let curr = payload;
	while (curr && typeof curr === "object") {
		if (Array.isArray(curr)) return curr as T[];
		if ("data" in curr) {
			curr = (curr as { data: unknown }).data;
		} else {
			break;
		}
	}
	return Array.isArray(curr) ? (curr as T[]) : [];
}

export const getAssignmentSubmissionsApi = async (
	params: GetAssignmentSubmissionsParams = {},
): Promise<AssignmentSubmissionsResponseData> => {
	const query = new URLSearchParams();
	if (params.page) query.set("page", String(params.page));
	if (params.limit) query.set("limit", String(params.limit));
	if (params.search?.trim()) query.set("search", params.search.trim());

	const response: ApiResponse<AssignmentSubmissionsResponseData> =
		await apiFetch(`/assignment-submissions?${query.toString()}`);
	return (
		response.data ?? {
			data: [],
			meta: {
				page: params.page ?? 1,
				limit: params.limit ?? 10,
				total: 0,
				totalPages: 0,
			},
		}
	);
};

export async function fetchAllSubmissionPageSources(): Promise<{
	assignments: RawAssignmentRecord[];
	submissions: RawSubmissionRecord[];
	years: RawAcademicYearRecord[];
	classes: RawClassRecord[];
	classStudents: RawClassStudentRecord[];
}> {
	const [
		assignmentsRes,
		submissionsRes,
		yearsRes,
		classesRes,
		classStudentsRes,
	] = await Promise.all([
		apiFetch("/assignments?limit=200"),
		apiFetch("/assignment-submissions?limit=500"),
		apiFetch("/academic-years?limit=100"),
		apiFetch("/classes?limit=100"),
		apiFetch("/class-students?limit=500").catch(() => ({ data: [] })),
	]);

	return {
		assignments: extractArray<RawAssignmentRecord>(assignmentsRes),
		submissions: extractArray<RawSubmissionRecord>(submissionsRes),
		years: extractArray<RawAcademicYearRecord>(yearsRes),
		classes: extractArray<RawClassRecord>(classesRes),
		classStudents: extractArray<RawClassStudentRecord>(classStudentsRes),
	};
}
