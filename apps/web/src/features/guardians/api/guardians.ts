import { apiFetch } from "@/lib/api";
import type {
	ApiResponse,
	CreateGuardianInput,
	Guardian,
	GuardiansResponse,
	UpdateGuardianInput,
} from "../types";

export interface GetGuardiansParams {
	page: number;
	limit: number;
	search?: string;
}

export const getGuardiansApi = async ({
	page,
	limit,
	search,
}: GetGuardiansParams): Promise<GuardiansResponse> => {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});

	const normalizedSearch = search?.trim();
	if (normalizedSearch) {
		params.set("search", normalizedSearch);
	}

	const response: ApiResponse<Guardian[]> = await apiFetch(
		`/guardians?${params.toString()}`,
	);
	const responseMeta = response.meta;
	const meta = {
		page: responseMeta?.currentPage ?? page,
		limit: responseMeta?.perPage ?? limit,
		total: responseMeta?.totalData ?? response.data.length,
		totalPages:
			responseMeta?.totalPages ?? (response.data.length > 0 ? 1 : 0),
	};

	return { data: response.data ?? [], meta };
};

export const getGuardianByIdApi = async (id: string): Promise<Guardian> => {
	const response: ApiResponse<Guardian> = await apiFetch(`/guardians/${id}`);
	return response.data;
};

export const createGuardianApi = async (
	input: CreateGuardianInput,
): Promise<Guardian> => {
	const response: ApiResponse<Guardian> = await apiFetch("/guardians", {
		method: "POST",
		body: JSON.stringify(input),
	});
	return response.data;
};

export const updateGuardianApi = async (
	id: string,
	input: UpdateGuardianInput,
): Promise<Guardian> => {
	const response: ApiResponse<Guardian> = await apiFetch(`/guardians/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input),
	});
	return response.data;
};

export const deleteGuardianApi = async (id: string): Promise<Guardian> => {
	const response: ApiResponse<Guardian> = await apiFetch(`/guardians/${id}`, {
		method: "DELETE",
	});
	return response.data;
};
