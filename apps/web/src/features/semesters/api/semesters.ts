import { apiFetch } from "@/lib/api";
import type {
	CreateSemesterInput,
	Semester,
	SemesterListResult,
	SemesterPageMeta,
	UpdateSemesterInput,
} from "../types";

interface ApiResponse<T> {
	data: T | null;
	meta?: SemesterPageMeta;
}

export interface GetSemestersParams {
	page: number;
	limit: number;
	search?: string;
	academic_year_id?: string;
}

const emptySemesterPage = (page: number, limit: number): SemesterListResult => ({
	data: [],
	meta: { page, limit, total: 0, totalPages: 0 },
});

export const getSemestersApi = async ({
	page,
	limit,
	search,
	academic_year_id,
}: GetSemestersParams): Promise<SemesterListResult> => {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});
	if (search?.trim()) params.set("search", search.trim());
	if (academic_year_id) params.set("academic_year_id", academic_year_id);

	const response: ApiResponse<Semester[]> = await apiFetch(
		`/semesters?${params.toString()}`,
	);
	return {
		data: response.data ?? [],
		meta: response.meta ?? emptySemesterPage(page, limit).meta,
	};
};

export const createSemesterApi = async (
	input: CreateSemesterInput,
): Promise<Semester> => {
	const response: ApiResponse<Semester> = await apiFetch("/semesters", {
		method: "POST",
		body: JSON.stringify(input),
	});
	if (!response.data) throw new Error("API tidak mengembalikan data semester.");
	return response.data;
};

export const updateSemesterApi = async (
	id: string,
	input: UpdateSemesterInput,
): Promise<Semester> => {
	const response: ApiResponse<Semester> = await apiFetch(`/semesters/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input),
	});
	if (!response.data) throw new Error("API tidak mengembalikan data semester.");
	return response.data;
};

export const deleteSemesterApi = async (id: string): Promise<{ id: string }> => {
	const response: ApiResponse<Semester | { id: string }> = await apiFetch(
		`/semesters/${id}`,
		{ method: "DELETE" },
	);
	return { id: response.data?.id ?? id };
};

