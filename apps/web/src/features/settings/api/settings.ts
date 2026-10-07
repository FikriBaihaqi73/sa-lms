import { apiFetch } from "@/lib/api";
import type {
	ApiResponse,
	CreateSettingInput,
	Setting,
	SettingPageMeta,
	SettingsResponse,
	UpdateSettingInput,
} from "../types";

export interface GetSettingsParams {
	page?: number;
	limit?: number;
	search?: string;
}

export const getSettingsApi = async ({
	page = 1,
	limit = 10,
	search,
}: GetSettingsParams = {}): Promise<SettingsResponse> => {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});

	const normalizedSearch = search?.trim();
	if (normalizedSearch) {
		params.set("search", normalizedSearch);
	}

	const response: ApiResponse<Setting[]> = await apiFetch(
		`/settings?${params.toString()}`,
	);
	const meta: SettingPageMeta = {
		page: response.meta?.currentPage ?? page,
		limit: response.meta?.perPage ?? limit,
		total: response.meta?.totalData ?? response.data?.length ?? 0,
		totalPages:
			response.meta?.totalPages ??
			(response.data && response.data.length > 0 ? 1 : 0),
	};

	return { data: response.data ?? [], meta };
};

export const getSettingByIdApi = async (id: string): Promise<Setting> => {
	const response: ApiResponse<Setting> = await apiFetch(`/settings/${id}`);
	return response.data;
};

export const createSettingApi = async (
	input: CreateSettingInput,
): Promise<Setting> => {
	const response: ApiResponse<Setting> = await apiFetch("/settings", {
		method: "POST",
		body: JSON.stringify(input),
	});
	return response.data;
};

export const updateSettingApi = async (
	id: string,
	input: UpdateSettingInput,
): Promise<Setting> => {
	const response: ApiResponse<Setting> = await apiFetch(`/settings/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input),
	});
	return response.data;
};

export const deleteSettingApi = async (id: string): Promise<Setting> => {
	const response: ApiResponse<Setting> = await apiFetch(`/settings/${id}`, {
		method: "DELETE",
	});
	return response.data;
};
