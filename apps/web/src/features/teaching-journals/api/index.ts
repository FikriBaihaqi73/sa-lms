import { apiFetch } from "@/lib/api";
import type {
	CreateTeachingJournalInput,
	TeachingJournal,
	TeachingJournalListResponse,
	TeachingJournalParams,
	UpdateTeachingJournalInput,
} from "../types";

export async function getTeachingJournals(
	params: TeachingJournalParams = {},
): Promise<TeachingJournalListResponse> {
	const query = new URLSearchParams({
		page: String(params.page ?? 1),
		limit: String(params.limit ?? 10),
	});

	if (params.search?.trim()) {
		query.set("search", params.search.trim());
	}
	if (params.schedule_id?.trim()) {
		query.set("schedule_id", params.schedule_id.trim());
	}
	if (params.journal_date?.trim()) {
		query.set("journal_date", params.journal_date.trim());
	}

	const response = (await apiFetch(
		`/teaching-journals?${query.toString()}`,
	)) as TeachingJournalListResponse;

	if (
		!response ||
		!Array.isArray(response.data) ||
		!response.meta ||
		typeof response.meta.totalPages !== "number"
	) {
		throw new Error("Respons daftar jurnal tidak valid.");
	}

	return response;
}

export async function getTeachingJournalById(
	id: string,
): Promise<TeachingJournal> {
	const response = (await apiFetch(
		`/teaching-journals/${encodeURIComponent(id)}`,
	)) as { data: TeachingJournal | null };

	if (!response?.data) {
		throw new Error("Respons detail jurnal tidak valid.");
	}

	return response.data;
}

export async function createTeachingJournal(
	data: CreateTeachingJournalInput,
): Promise<TeachingJournal> {
	const response = (await apiFetch("/teaching-journals", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	})) as { data: TeachingJournal };

	return response.data;
}

export async function updateTeachingJournal(
	id: string,
	data: UpdateTeachingJournalInput,
): Promise<TeachingJournal> {
	const response = (await apiFetch(
		`/teaching-journals/${encodeURIComponent(id)}`,
		{
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		},
	)) as { data: TeachingJournal };

	return response.data;
}

export async function deleteTeachingJournal(
	id: string,
): Promise<{ success: boolean; id?: string }> {
	const response = (await apiFetch(
		`/teaching-journals/${encodeURIComponent(id)}`,
		{
			method: "DELETE",
		},
	)) as { data: { success: boolean; id?: string } };

	return response?.data ?? { success: true, id };
}

// Backward compatibility exports
export const getJournals = getTeachingJournals;
export const getJournal = getTeachingJournalById;
