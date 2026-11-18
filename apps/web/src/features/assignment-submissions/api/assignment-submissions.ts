import { apiFetch } from "@/lib/api";
import type { SubmissionRow } from "../types";

/**
 * Endpoint assignment-submissions API client.
 * NOTE: Sesuai Task 0238, integrasi operasional GET /assignment-submissions
 * masih menunggu pembenahan backend (scoping, filter assignmentId, keamanan grader).
 */

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
