import { apiFetch } from "@/lib/api";
import type {
	CreateSubjectInput,
	Subject,
	SubjectApiResponse,
	SubjectPage,
	SubjectQuery,
	UpdateSubjectInput,
} from "../types";

export async function getSubjectsApi(query: SubjectQuery): Promise<SubjectPage> {
	const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit) });
	if (query.search) params.set("search", query.search);
	const response: SubjectApiResponse<SubjectPage> = await apiFetch(`/subjects?${params}`);
	return response.data.data;
}

export async function createSubjectApi(input: CreateSubjectInput): Promise<Subject> {
	const response: SubjectApiResponse<Subject> = await apiFetch("/subjects", {
		method: "POST",
		body: JSON.stringify(input),
	});
	return response.data.data;
}

export async function updateSubjectApi(id: string, input: UpdateSubjectInput): Promise<Subject> {
	const response: SubjectApiResponse<Subject> = await apiFetch(`/subjects/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input),
	});
	return response.data.data;
}

export async function deleteSubjectApi(id: string): Promise<void> {
	await apiFetch(`/subjects/${id}`, { method: "DELETE" });
}
