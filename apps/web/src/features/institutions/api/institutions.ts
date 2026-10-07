import { apiFetch } from "@/lib/api";
import type {
	ApiResponse,
	CreateInstitutionInput,
	Institution,
	InstitutionLevel,
	InstitutionListResult,
	UpdateInstitutionInput,
} from "../types";

export interface ListInstitutionsParams {
	page?: number;
	limit?: number;
	search?: string;
}

const DEFAULT_META = {
	totalData: 0,
	totalPages: 0,
	currentPage: 1,
	perPage: 10,
};

export const listInstitutionsApi = async (
	params: ListInstitutionsParams = {},
): Promise<InstitutionListResult> => {
	const query = new URLSearchParams();
	query.set("page", String(params.page ?? 1));
	query.set("limit", String(params.limit ?? 10));
	if (params.search?.trim()) query.set("search", params.search.trim());

	const response: ApiResponse<Institution[]> = await apiFetch(
		`/institutions?${query.toString()}`,
	);
	return {
		data: response.data ?? [],
		meta: response.meta ?? {
			...DEFAULT_META,
			currentPage: params.page ?? 1,
			perPage: params.limit ?? 10,
		},
	};
};

export const getInstitutionLevelsApi = async (): Promise<
	InstitutionLevel[]
> => {
	const response: ApiResponse<InstitutionLevel[]> = await apiFetch(
		"/institution-levels",
	);
	return response.data ?? [];
};

export const createInstitutionApi = async (
	input: CreateInstitutionInput,
): Promise<Institution> => {
	const response: ApiResponse<Institution> = await apiFetch("/institutions", {
		method: "POST",
		body: JSON.stringify(input),
	});
	return response.data;
};

export const updateInstitutionApi = async (
	id: string,
	input: UpdateInstitutionInput,
): Promise<Institution> => {
	const response: ApiResponse<Institution> = await apiFetch(
		`/institutions/${id}`,
		{
			method: "PATCH",
			body: JSON.stringify(input),
		},
	);
	return response.data;
};

export const deleteInstitutionApi = async (
	id: string,
): Promise<{ id: string }> => {
	const response: ApiResponse<{ id: string; success?: boolean }> =
		await apiFetch(`/institutions/${id}`, { method: "DELETE" });
	return { id: response.data?.id ?? id };
};
